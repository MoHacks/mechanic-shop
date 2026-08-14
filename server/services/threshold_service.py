# server/services/threshold_service.py
from sqlalchemy.orm import Session
from models import Threshold
from schemas import Threshold as ThresholdSchema, ThresholdUpdate
from websocket_manager import manager

async def set_threshold(db: Session, threshold_update: ThresholdUpdate):
    # return threshold
    threshold = db.query(Threshold).first()

    print("ok1")

    # if no entries in database
    if not threshold:
        # create a new threshold
        threshold = Threshold(value=threshold_update.value)
        db.add(threshold)
    else:
        threshold.value = threshold_update.value
    
    print("ok2")
    db.commit()

    db.refresh(threshold)

    await manager.broadcast("threshold_changed")
    print("ok3")
    return threshold