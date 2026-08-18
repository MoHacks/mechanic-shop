# server/services/threshold_service.py
from sqlalchemy.orm import Session
from models import Threshold
from schemas import ThresholdUpdate
from websocket_manager import manager

async def set_threshold(db: Session, category: str, threshold_update: ThresholdUpdate):
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
