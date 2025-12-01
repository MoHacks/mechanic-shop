# routers/logs.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from db import get_db
from models import Log

router = APIRouter(prefix="/logs", tags=["Logs"])

@router.post("/")
def create_log(action: str, db: Session = Depends(get_db)):
    log = Log(action=action, created_at=datetime.utcnow())
    db.add(log)
    db.commit()
    db.refresh(log)
    return {"message": "Log created", "log": {"action": log.action, "created_at": log.created_at}}

@router.get("/")
def get_logs(db: Session = Depends(get_db)):
    return db.query(Log).all()
    
