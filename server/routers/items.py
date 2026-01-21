# routers/items.py
from unicodedata import category
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from db import get_db
from models import Tire, Item, Log # Change to Item since we no longer focus just on tires, but on all inventory items
from schemas import ItemCreate, TireCreate, Tire as TireSchema
from datetime import datetime
from websocket_manager import manager


# TODO: Add the response_model for each of the endpoints (should be of type "Item")


# change from "tires" to "items"
router = APIRouter(prefix="/items", tags=["Items"])

# GET all tires - response_model here is a FastAPI parameter that tells FastAPI: 
# “When returning a response from this endpoint, validate it, filter it, and serialize it using this Pydantic model.”

@router.get("/")
def get_tires(category: str, db: Session = Depends(get_db)):  
    print("payload: ", category)  
    query = db.query(Item)
    print("query: ", query)
    if query:
        query = query.filter(Item.category == category)

    return query.all()

    # return db.query(Item).all() 

# POST create tire
@router.post("/create")
# async def create_tire(item: TireCreate, db: Session = Depends(get_db)):
async def create_tire(item: ItemCreate, db: Session = Depends(get_db)):    
    print("bakcned item: ", item)
    existing = db.query(Item).filter(Item.name == item.name, Item.category == item.category).first()
    print("existing: ", existing)
    if existing:
        raise HTTPException(status_code=400, detail="Item already exists")
    
    # TODO: Deal with this eventually...
    # if category !== "tires":
    #     item.used = 0
    
    new_item = Item(category=item.category, name=item.name, mode="dual", new=item.new, used=item.used) # TODO: mode will always be dual for now....change it later
    
    db.add(new_item)

    # Check log count, if its greater than 1000, delete the oldest record (to keep the db size small to save space)
    log_count = db.query(Log).count()
    if log_count >= 1000:
        # Delete the oldest log
        oldest_log = db.query(Log).order_by(Log.created_at.asc()).first()
        if oldest_log:
            db.delete(oldest_log)

    # Log action
    db.add(Log(action=f"created Item '{item.name}'", created_at=datetime.utcnow()))

    db.commit()
    db.refresh(new_item)

    # Notify all WebSocket clients asynchronously
    await manager.broadcast("tire_created")

    return new_item


# POST add tire
@router.post("/add")
async def create_tire(item: ItemCreate, db: Session = Depends(get_db)):
    
    existing = db.query(Item).filter(Item.name == item.name, Item.category == item.category).first()
    
    if existing:
        
        # Increment existing tire quantities
        existing.new += item.new
        existing.used += item.used

        # Check log count, if its greater than 10, delete the oldest record (to keep the db size small to save space)
        log_count = db.query(Log).count()
        if log_count >= 1000:
            # Delete the oldest log
            oldest_log = db.query(Log).order_by(Log.created_at.asc()).first()
            if oldest_log:
                db.delete(oldest_log)

        db.add(Log(
            action=f"added Item '{item.name}' (+{item.new} new, +{item.used} used)",
            created_at=datetime.utcnow()
        ))
        db.commit()
        db.refresh(existing)

        # Notify clients via WebSocket
        await manager.broadcast("tire_added")

        return existing
    
    raise HTTPException(status_code=404, detail="Item not found")
    

# DELETE tire
# name: str is expected to come in as a query parameter -> DELETE /tires/?name=SomeName
@router.delete("/")
async def delete_tire(name: str, category:str, db: Session = Depends(get_db)):
    item = db.query(Item).filter(Item.name == name, Item.category == category).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(item)

    # Check log count, if its greater than 10, delete the oldest record (to keep the db size small to save space)
    log_count = db.query(Log).count()
    if log_count >= 1000:
        # Delete the oldest log
        oldest_log = db.query(Log).order_by(Log.created_at.asc()).first()
        if oldest_log:
            db.delete(oldest_log)
            
    # Log action
    db.add(Log(action=f"deleted Item '{name}'", created_at=datetime.utcnow()))

    db.commit()

    # Notify all WebSocket clients asynchronously
    await manager.broadcast("tire_deleted")
    
    return {"message": f"Item '{name}' deleted"}

# POST remove tires
@router.post("/remove")
async def delete_tire(item: ItemCreate, db: Session = Depends(get_db)):

    existing = db.query(Item).filter(Item.name == item.name, Item.category == item.category).first()

    if existing:
        # raise HTTPException(status_code=400, detail="Tire already exists")
    
        # Increment existing tire quantities
        existing.new -= item.new
        existing.used -= item.used

        if existing.new < 0 or existing.used < 0:
            raise HTTPException(status_code=403, detail="Cannot remove less than 0 inventory")
        
        # Check log count, if its greater than 10, delete the oldest record (to keep the db size small to save space)
        log_count = db.query(Log).count()
        if log_count >= 1000:
            # Delete the oldest log
            oldest_log = db.query(Log).order_by(Log.created_at.asc()).first()
            if oldest_log:
                db.delete(oldest_log)

        db.add(Log(
            action=f"removed Item '{item.name}' (-{item.new} new, -{item.used} used)",
            created_at=datetime.utcnow()
        ))
        db.commit()
        db.refresh(existing)

        # Notify clients via WebSocket
        await manager.broadcast("tire_removed")

        return existing
        
    raise HTTPException(status_code=404, detail="Item not found")

# @router.put("/update")
# async def update_tire(name: str, tire_update: TireCreate, db: Session = Depends(get_db)):
#     tire = db.query(Tire).filter(Tire.name == name).first()
#     if not tire:
#         raise HTTPException(status_code=404, detail="Tire not found")
#     tire.name = tire_update.name
#     tire.new = tire_update.new
#     tire.used = tire_update.used
#     db.commit()
#     db.refresh(tire)
#     return tire

# PUT update tire (strictly for this application - DOES NOT APPLY TO THE n8n workflow)
@router.put("/update")
async def update_tire(item: ItemCreate, db: Session = Depends(get_db)):
    
    # query the table __tablename__ == "tires" (mentioned in the Tire class in models.py), and find the 
    # name of the tire in the database (Tire.name) is the same name that is passed in from the frontend (name)
    
    print("backend item: ", item)
    existing = db.query(Item).filter(Item.name == item.name, Item.category == item.category).first()


    if not item:
        raise HTTPException(status_code=404, detail="Tire not found")

    print("item.mode: ", item.mode)


    # TODO: WILL WORK ON THIS LATER....
    # if item.mode == "dual":
    #     item.new = new
    #     item.used = used

    # else:
    #     item.new = new # used wont exist for 'single' mode
    
    existing.new = item.new
    existing.used = item.used
    existing.mode = item.mode 

    # Check log count, if its greater than 10, delete the oldest record (to keep the db size small to save space)
    log_count = db.query(Log).count()
    if log_count >= 1000:
        # Delete the oldest log
        oldest_log = db.query(Log).order_by(Log.created_at.asc()).first()
        if oldest_log:
            db.delete(oldest_log)

    db.add(Log(
        action=f"updated Item '{item.name}' ({item.new} new, {item.used} used)",
        created_at=datetime.utcnow()
    ))

    db.commit()
    db.refresh(existing)

    await manager.broadcast("tire_updated")

    return item