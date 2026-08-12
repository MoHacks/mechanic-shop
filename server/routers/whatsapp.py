from fastapi import APIRouter, Request, BackgroundTasks
from fastapi import APIRouter, Request, BackgroundTasks, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session
from db import get_db, SessionLocal
# from alembic.env import TWILIO_AUTH_TOKEN, TWILIO_SID
from services.command_dispatcher import handle_command
from twilio.rest import Client
import os
from dotenv import load_dotenv

load_dotenv()  # loads your .env file
DATABASE_URL = os.getenv("DATABASE_URL")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_SID = os.getenv("TWILIO_SID")
print(DATABASE_URL, TWILIO_AUTH_TOKEN, TWILIO_SID)

router = APIRouter(prefix="/whatsapp", tags=["WhatsApp"])
twilio_client = Client(TWILIO_SID,TWILIO_AUTH_TOKEN)



async def process_whatsapp_message(body: str, from_number: str):
    db = SessionLocal()
    try:
        reply_text = await handle_command(db, body)
    finally:
        db.close()

    # NOTE: Must use +1 prefix for all numbers
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

    print("body: ", body)
    print("Author: ", from_number)
    background_tasks.add_task(process_whatsapp_message, body, from_number)

    # TODO: Explain why db is not used here in an extensive Medium article...
    # background_tasks.add_task(process_whatsapp_message, body, from_number, db)

    return Response(content="<Response></Response>", media_type="application/xml")