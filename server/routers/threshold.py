from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from db import get_db
from models import Threshold

# It is so important that this Threshold value is renamed because it clashes with the Threshold name from models.py
from schemas import Threshold as ThresholdSchema, ThresholdUpdate
from websocket_manager import manager

router = APIRouter(prefix="/threshold", tags=["Threshold"])

@router.get("/", response_model=ThresholdSchema)
async def get_threshold(db : Session = Depends(get_db)):
    # await manager.broadcast("threshold_changed")
    return db.query(Threshold).first() 


# threshold is of typic pydanctic object
@router.put("/", response_model=ThresholdSchema) # function 
async def set_threshold(threshold_update: ThresholdUpdate, request: Request, db: Session = Depends(get_db)):
    
    print(await request.json())  # This will show exactly what body FastAPI received

    # DB object
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



