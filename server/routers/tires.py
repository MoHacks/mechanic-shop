# routers/tires.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from db import get_db
from models import Tire, Log
from schemas import TireCreate, Tire as TireSchema
from datetime import datetime
from websocket_manager import manager


router = APIRouter(prefix="/tires", tags=["Tires"])

# GET all tires
@router.get("/", response_model=List[TireSchema])
def get_tires(db: Session = Depends(get_db)):
    return db.query(Tire).all()

# POST create tire
@router.post("/create", response_model=TireSchema)
async def create_tire(tire: TireCreate, db: Session = Depends(get_db)):
    
    existing = db.query(Tire).filter(Tire.name == tire.name).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Tire already exists")
    
        
    new_tire = Tire(name=tire.name, new=tire.new, used=tire.used)
    
    db.add(new_tire)

    # Check log count, if its greater than 1000, delete the oldest record (to keep the db size small to save space)
    log_count = db.query(Log).count()
    if log_count >= 1000:
        # Delete the oldest log
        oldest_log = db.query(Log).order_by(Log.created_at.asc()).first()
        if oldest_log:
            db.delete(oldest_log)

    # Log action
    db.add(Log(action=f"created Tire '{tire.name}'", created_at=datetime.utcnow()))

    db.commit()
    db.refresh(new_tire)

    # Notify all WebSocket clients asynchronously
    await manager.broadcast("tire_created")

    return new_tire


# POST add tire
@router.post("/add", response_model=TireSchema)
async def create_tire(tire: TireCreate, db: Session = Depends(get_db)):
    
    existing = db.query(Tire).filter(Tire.name == tire.name).first()
    
    if existing:
        
        # Increment existing tire quantities
        existing.new += tire.new
        existing.used += tire.used

        # Check log count, if its greater than 10, delete the oldest record (to keep the db size small to save space)
        log_count = db.query(Log).count()
        if log_count >= 1000:
            # Delete the oldest log
            oldest_log = db.query(Log).order_by(Log.created_at.asc()).first()
            if oldest_log:
                db.delete(oldest_log)

        db.add(Log(
            action=f"added Tire '{tire.name}' (+{tire.new} new, +{tire.used} used)",
            created_at=datetime.utcnow()
        ))
        db.commit()
        db.refresh(existing)

        # Notify clients via WebSocket
        await manager.broadcast("tire_added")

        return existing
    
    raise HTTPException(status_code=404, detail="Tire not found")
    

# DELETE tire

# name: str is expected to come in as a query parameter -> DELETE /tires/?name=SomeName
@router.delete("/")
async def delete_tire(name: str, db: Session = Depends(get_db)):
    tire = db.query(Tire).filter(Tire.name == name).first()
    if not tire:
        raise HTTPException(status_code=404, detail="Tire not found")
    db.delete(tire)

    # Check log count, if its greater than 10, delete the oldest record (to keep the db size small to save space)
    log_count = db.query(Log).count()
    if log_count >= 1000:
        # Delete the oldest log
        oldest_log = db.query(Log).order_by(Log.created_at.asc()).first()
        if oldest_log:
            db.delete(oldest_log)
            
    # Log action
    db.add(Log(action=f"deleted Tire '{name}'", created_at=datetime.utcnow()))

    db.commit()

    # Notify all WebSocket clients asynchronously
    await manager.broadcast("tire_deleted")
    
    return {"message": f"Tire '{name}' deleted"}

# POST remove tires
@router.post("/remove")
async def delete_tire(tire: TireCreate, db: Session = Depends(get_db)):

    existing = db.query(Tire).filter(Tire.name == tire.name).first()
    
    if existing:
        # raise HTTPException(status_code=400, detail="Tire already exists")
    
        # Increment existing tire quantities
        existing.new -= tire.new
        existing.used -= tire.used

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
            action=f"removed Tire '{tire.name}' (-{tire.new} new, -{tire.used} used)",
            created_at=datetime.utcnow()
        ))
        db.commit()
        db.refresh(existing)

        # Notify clients via WebSocket
        await manager.broadcast("tire_removed")

        return existing
        
    raise HTTPException(status_code=404, detail="Tire not found")

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
async def update_tire(
    name: str,
    new: int,
    used: int,
    db: Session = Depends(get_db)
):
    tire = db.query(Tire).filter(Tire.name == name).first()

    if not tire:
        raise HTTPException(status_code=404, detail="Tire not found")

    tire.new = new
    tire.used = used

    # Check log count, if its greater than 10, delete the oldest record (to keep the db size small to save space)
    log_count = db.query(Log).count()
    if log_count >= 1000:
        # Delete the oldest log
        oldest_log = db.query(Log).order_by(Log.created_at.asc()).first()
        if oldest_log:
            db.delete(oldest_log)

    db.add(Log(
        action=f"updated Tire '{tire.name}' ({tire.new} new, {tire.used} used)",
        created_at=datetime.utcnow()
    ))

    db.commit()
    db.refresh(tire)

    await manager.broadcast("tire_updated")

    return tire