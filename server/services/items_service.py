# server/services/items_service.py
from sqlalchemy.orm import Session
from models import Item, Log
from datetime import datetime
from websocket_manager import manager


async def create_tire(db: Session, name: str, category: str = "tires", new: int = 0, used: int = 0):
    existing = db.query(Item).filter(Item.name == name).first()
    if existing:
        raise ValueError(f"Tire '{name}' already exists.")
    item = Item(name=name, category=category, new=new, used=used)
    db.add(item)
    db.add(Log(action=f"created tire '{name}'", created_at=datetime.utcnow()))
    db.commit()
    db.refresh(item)

    await manager.broadcast("tire_created") # <--- fires for REST AND WhatsApp

    return item

async def add_item_quantity(db: Session, name: str, new: int = 0, used: int = 0):
    item = db.query(Item).filter(Item.name == name).first()
    if not item:
        raise ValueError(f"Tire '{name}' not found.")
    item.new += new
    item.used += used
    db.add(Log(action=f"added {new} new/{used} used to '{name}'", created_at=datetime.utcnow()))
    db.commit()
    db.refresh(item)

    await manager.broadcast("tire_added") # <--- fires for REST AND WhatsApp

    return item
    

# server/services/items_service.py
async def delete_tire(db: Session, name: str):
    item = db.query(Item).filter(Item.name == name).first()
    if not item:
        raise ValueError(f"Tire '{name}' not found.")

    db.delete(item)
    db.add(Log(action=f"deleted tire '{name}'", created_at=datetime.utcnow()))
    db.commit()

    await manager.broadcast("tire_deleted") # <--- fires for REST AND WhatsApp

    return name