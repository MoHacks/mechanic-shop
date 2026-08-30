import json
from fastapi import APIRouter, Request, BackgroundTasks, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session
from db import get_db, SessionLocal
from services.command_dispatcher import handle_command
from twilio.rest import Client
from faster_whisper import WhisperModel
from config import settings
import os
import tempfile
import requests as http_requests

router = APIRouter(prefix="/whatsapp", tags=["WhatsApp"])
twilio_client = Client(settings.TWILIO_SID, settings.TWILIO_AUTH_TOKEN)

# Normalise a raw Author value to E.164 (strip any "whatsapp:" prefix)
def _e164(number: str) -> str:
    return number.replace("whatsapp:", "").strip()

# Build the authorised-number set from the env var (empty = allow all)
_ALLOWED: set[str] = {
    _e164(n) for n in settings.ALLOWED_NUMBERS.split(",") if n.strip()
}

_COMMAND_HINT = """
─────────────────────────
💬 *Example commands:*
• "Create a table for brakes chart"
• "Create new brakes called random"
• "Add michelin to tires chart"
• "Add 5 new and 2 used to michelin in tires chart"
• "Set tires chart threshold to 50"
• "What is the threshold for the tires chart"
• "List all items above the threshold in the tires chart"
• "List all brakelines below the threshold"
• "Delete michelin from tires chart"

⚠️ To delete a chart, please use the browser.
─────────────────────────"""

whisper_model = WhisperModel("medium", device="cpu", compute_type="int8")


def transcribe_voice_note(media_url: str) -> str:
    print("🎙️  Transcribing voice note...")
    response = http_requests.get(media_url, auth=(settings.TWILIO_SID, settings.TWILIO_AUTH_TOKEN))
    response.raise_for_status()

    with tempfile.NamedTemporaryFile(suffix=".ogg", delete=False) as tmp:
        tmp.write(response.content)
        tmp_path = tmp.name

    try:
        segments, _ = whisper_model.transcribe(tmp_path)
        transcript = " ".join(segment.text.strip() for segment in segments)
        print(f"🎙️  Transcription result: {transcript}")
        return transcript
    finally:
        os.unlink(tmp_path)


async def process_whatsapp_message(body: str, from_number: str, media_url: str = None, media_content_type: str = None):
    db = SessionLocal()
    print(f"📩 Processing message from {from_number}: '{body}'")
    try:
        if media_url and media_content_type and media_content_type.startswith("audio/"):
            body = transcribe_voice_note(media_url)
        reply_text = await handle_command(db, body) + _COMMAND_HINT
        print(f"✅ Reply: {reply_text[:80]}...")
    finally:
        db.close()

    to = from_number if from_number.startswith("whatsapp:") else f"whatsapp:{from_number}"
    twilio_client.messages.create(
        from_=settings.TWILIO_WHATSAPP_NUMBER,
        to=to,
        body=reply_text
    )
    print(f"📤 Reply sent to {to}")


@router.post("/webhook")
async def whatsapp_webhook(request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    form = await request.form()
    print("─" * 40)
    print("📬 Webhook received")

    body = form.get("Body", "")
    from_number = form.get("Author") or form.get("From")
    chat_service_sid = form.get("ChatServiceSid")

    print(f"   From:    {from_number}")
    print(f"   Body:    '{body}'")

    media_url = None
    media_content_type = None
    media_json = form.get("Media")

    if media_json:
        media_list = json.loads(media_json)
        if media_list:
            first_media = media_list[0]
            media_content_type = first_media.get("ContentType", "")
            if media_content_type.startswith("audio/"):
                media_sid = first_media.get("Sid")
                media_url = f"https://mcs.us1.twilio.com/v1/Services/{chat_service_sid}/Media/{media_sid}/Content"
                print(f"   Media:   audio ({media_content_type})")
    elif form.get("NumMedia", "0") != "0":
        media_content_type = form.get("MediaContentType0", "")
        if media_content_type.startswith("audio/"):
            media_url = form.get("MediaUrl0")
            print(f"   Media:   audio ({media_content_type})")

    # Allowlist check — reject unauthorised senders
    if _ALLOWED and _e164(from_number or "") not in _ALLOWED:
        print(f"⛔ Rejected unauthorised sender: {from_number}")
        to = from_number if from_number.startswith("whatsapp:") else f"whatsapp:{from_number}"
        twilio_client.messages.create(
            from_=settings.TWILIO_WHATSAPP_NUMBER,
            to=to,
            body="⛔ You are not authorised to use this system."
        )
        return Response(content="<Response></Response>", media_type="application/xml")

    background_tasks.add_task(process_whatsapp_message, body, from_number, media_url, media_content_type)
    print("   Queued for processing")

    return Response(content="<Response></Response>", media_type="application/xml")
