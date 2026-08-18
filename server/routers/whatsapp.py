import json
from fastapi import APIRouter, Request, BackgroundTasks, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session
from db import get_db, SessionLocal
from services.command_dispatcher import handle_command
from twilio.rest import Client
from faster_whisper import WhisperModel
import os
import tempfile
import requests as http_requests
from dotenv import load_dotenv

load_dotenv()
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_SID = os.getenv("TWILIO_SID")

router = APIRouter(prefix="/whatsapp", tags=["WhatsApp"])
twilio_client = Client(TWILIO_SID, TWILIO_AUTH_TOKEN)

whisper_model = WhisperModel("medium", device="cpu", compute_type="int8")


def transcribe_voice_note(media_url: str) -> str:
    response = http_requests.get(media_url, auth=(TWILIO_SID, TWILIO_AUTH_TOKEN))
    response.raise_for_status()

    with tempfile.NamedTemporaryFile(suffix=".ogg", delete=False) as tmp:
        tmp.write(response.content)
        tmp_path = tmp.name

    try:
        segments, _ = whisper_model.transcribe(tmp_path)
        return " ".join(segment.text.strip() for segment in segments)
    finally:
        os.unlink(tmp_path)


async def process_whatsapp_message(body: str, from_number: str, media_url: str = None, media_content_type: str = None):
    db = SessionLocal()
    try:
        if media_url and media_content_type and media_content_type.startswith("audio/"):
            body = transcribe_voice_note(media_url)
            print("BODY: ", body)
        reply_text = await handle_command(db, body)
    finally:
        db.close()

    twilio_client.messages.create(
        from_="whatsapp:+14155238886",
        to=from_number,
        body=reply_text
    )


@router.post("/webhook")
async def whatsapp_webhook(request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    form = await request.form()
    print("GOT MESSAGE:", dict(form))

    body = form.get("Body", "")
    from_number = form.get("Author")
    chat_service_sid = form.get("ChatServiceSid")

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

    print("media_url: ", media_url)
    print("media_content_type: ", media_content_type)
    print("body: ", body)
    print("Author: ", from_number)
    background_tasks.add_task(process_whatsapp_message, body, from_number, media_url, media_content_type)

    return Response(content="<Response></Response>", media_type="application/xml")
