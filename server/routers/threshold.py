from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from db import get_db
from models import Threshold
from schemas import Threshold as ThresholdSchema, ThresholdUpdate
from websocket_manager import manager

router = APIRouter(prefix="/items/threshold", tags=["Threshold"])

@router.get("/")
async def get_threshold(category: str, db: Session = Depends(get_db)):
    threshold = db.query(Threshold).filter(Threshold.category == category).first()
    if not threshold:
        return {"id": 0, "category": category, "value": 0}
    return threshold


@router.put("/", response_model=ThresholdSchema)
async def set_threshold(category: str, threshold_update: ThresholdUpdate, db: Session = Depends(get_db)):
    threshold = db.query(Threshold).filter(Threshold.category == category).first()

    if not threshold:
        threshold = Threshold(category=category, value=threshold_update.value)
        db.add(threshold)
    else:
        threshold.value = threshold_update.value

    db.commit()
    db.refresh(threshold)

    await manager.broadcast("threshold_changed")
    return threshold
