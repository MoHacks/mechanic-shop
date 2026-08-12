# server/services/threshold_service.py
from sqlalchemy.orm import Session
from models import Threshold

def set_threshold(db: Session, category: str, value: int):
    threshold = db.query(Threshold).filter(Threshold.category == category).first()
    if not threshold:
        threshold = Threshold(category=category, value=value)
        db.add(threshold)
    else:
        threshold.value = value
    db.commit()
    db.refresh(threshold)
    return threshold