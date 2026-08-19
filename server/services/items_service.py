# server/services/items_service.py
from sqlalchemy.orm import Session
from models import Item, Log
from datetime import datetime
from websocket_manager import manager


async def create_tire(db: Session, name: str, category: str = "tires", new: int = 0, used: int = 0):
    existing = db.query(Item).filter(Item.name == name, Item.category == category).first()
    if existing:
        raise ValueError(f"'{name}' already exists in '{category}'.")
    item = Item(name=name, category=category, new=new, used=used)
    db.add(item)
    db.add(Log(action=f"created Item '{name}' in '{category}'", created_at=datetime.utcnow()))
    db.commit()
    db.refresh(item)

    await manager.broadcast("tire_created")

    return item

async def add_item_quantity(db: Session, name: str, category: str = "tires", new: int = 0, used: int = 0):
    item = db.query(Item).filter(Item.name == name, Item.category == category).first()
    if not item:
        raise ValueError(f"'{name}' not found in '{category}'.")
    item.new += new
    item.used += used
    db.add(Log(action=f"added {new} new/{used} used to '{name}' in '{category}'", created_at=datetime.utcnow()))
    db.commit()
    db.refresh(item)

    await manager.broadcast("tire_added")

    return item

async def delete_tire(db: Session, name: str, category: str = "tires"):
    item = db.query(Item).filter(Item.name == name, Item.category == category).first()
    if not item:
        raise ValueError(f"'{name}' not found in '{category}'.")

    db.delete(item)
    db.add(Log(action=f"deleted Item '{name}' from '{category}'", created_at=datetime.utcnow()))
    db.commit()

    await manager.broadcast("tire_deleted")

    return name