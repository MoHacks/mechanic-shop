# server/services/command_dispatcher.py
import random
from datetime import datetime
from sqlalchemy.orm import Session
from services.command_parser import parse_command
from services import items_service, threshold_service
from schemas import ThresholdUpdate
from models import Category, Log
from websocket_manager import manager

async def handle_command(db: Session, text: str) -> str:
    parsed = parse_command(text)
    action = parsed["action"]

    try:
        if action == "create_tire":
            category = parsed.get("category", "tires")
            item = await items_service.create_tire(db, name=parsed["name"], category=category)
            return f"✅ Created '{item.name}' in '{category}'."

        elif action == "add_quantity":
            category = parsed.get("category", "tires")
            item = await items_service.add_item_quantity(db, name=parsed["name"], category=category, new=parsed["new"], used=parsed["used"])
            return f"✅ Added {parsed['new']} new/{parsed['used']} used to '{item.name}' in '{category}'.\nNew total: {item.new}. Used total: {item.used}."

        elif action == "set_threshold":
            category = parsed.get("category", "tires")
            threshold = await threshold_service.set_threshold(db, category, ThresholdUpdate(value=parsed["value"]))
            return f"✅ Threshold for '{category}' set to {threshold.value}."

        elif action == "delete_tire":
            category = parsed.get("category", "tires")
            await items_service.delete_tire(db, name=parsed["name"], category=category)
            return f"✅ Deleted '{parsed['name']}' from '{category}'."

        elif action == "create_category":
            cat_name = parsed.get("category_name", "").strip().lower()
            if not cat_name:
                return "⚠️ Please provide a name for the new chart."
            existing = db.query(Category).filter(Category.name == cat_name).first()
            if existing:
                return f"⚠️ A chart called '{cat_name}' already exists."
            color_start = f"rgb({random.randint(0,255)},{random.randint(0,255)},{random.randint(0,255)})"
            color_end   = f"rgb({random.randint(0,255)},{random.randint(0,255)},{random.randint(0,255)})"
            db.add(Category(name=cat_name, color_start=color_start, color_end=color_end))
            db.add(Log(action=f"Chart created: {cat_name}", created_at=datetime.utcnow()))
            db.commit()
            await manager.broadcast("category_created")
            return f"✅ Chart '{cat_name}' created."

        else:
            return "❓ Sorry, I didn't understand that command."

    except ValueError as e:
        return f"⚠️ {str(e)}"