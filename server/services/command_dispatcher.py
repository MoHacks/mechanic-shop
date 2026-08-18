# server/services/command_dispatcher.py
from sqlalchemy.orm import Session
from services.command_parser import parse_command
from services import items_service, threshold_service
from schemas import ThresholdUpdate

async def handle_command(db: Session, text: str) -> str:
    parsed = parse_command(text)
    action = parsed["action"]

    try:
        if action == "create_tire":
            item = await items_service.create_tire(db, name=parsed["name"])
            return f"✅ Created tire '{item.name}'."

        elif action == "add_quantity":
            item = await items_service.add_item_quantity(db, name=parsed["name"], new=parsed["new"], used=parsed["used"])
            return f"✅ Added {parsed['new']} new/{parsed['used']} used to '{item.name}'.\n New total: {item.new}. Used total: {item.used}."

        elif action == "set_threshold":
            threshold_update = ThresholdUpdate(value=parsed["value"])
            category = parsed.get("category", "tires")
            threshold = await threshold_service.set_threshold(db, category, threshold_update)
            return f"✅ Threshold for '{category}' set to {threshold.value}."

        elif action == "delete_tire":
            await items_service.delete_tire(db, name=parsed["name"])
            return f"✅ Deleted tire '{parsed['name']}'."
            
        else:
            return "❓ Sorry, I didn't understand that command."

    except ValueError as e:
        return f"⚠️ {str(e)}"