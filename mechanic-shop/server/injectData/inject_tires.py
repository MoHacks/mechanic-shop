# inject_tires.py
from sqlalchemy.orm import Session
from db import SessionLocal, engine, Base
from models import Tire

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

# Sample data
tires_data = [
    { "name": "Tire A", "new": 400, "used": 240 },
    { "name": "Tire B", "new": 300, "used": 456 },
    { "name": "Tire C", "new": 200, "used": 139 },
    { "name": "Tire D", "new": 278, "used": 390 },
    { "name": "Tire E", "new": 678, "used": 610 },
    { "name": "Tire F", "new": 178, "used": 440 },
    { "name": "Tire G", "new": 810, "used": 200 },
]

def inject_tires():
    db: Session = SessionLocal()
    try:
        for tire in tires_data:
            # Check if tire already exists
            existing = db.query(Tire).filter(Tire.name == tire["name"]).first()
            if not existing:
                db.add(Tire(name=tire["name"], new=tire["new"], used=tire["used"]))
        db.commit()
        print("Tires injected successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    inject_tires()
