# inject_tires.py
from sqlalchemy.orm import Session
from db import SessionLocal, engine, Base
from models import Item

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

# Sample data
items_data = [
    # { "category": "tires", "name": "Tire A", "mode": "dual", "new": 400, "used": 240 },
    # { "category": "tires", "name": "Tire B", "mode": "dual", "new": 300, "used": 456 },
    # { "category": "tires", "name": "Tire C", "mode": "dual", "new": 200, "used": 139 },
    # { "category": "tires", "name": "Tire D", "mode": "dual", "new": 278, "used": 390 },
    # { "category": "tires", "name": "Tire E", "mode": "dual", "new": 678, "used": 610 },
    # { "category": "tires", "name": "Tire F", "mode": "dual", "new": 178, "used": 440 },
    # { "category": "tires", "name": "Tire G", "mode": "dual", "new": 810, "used": 200 },

    # { "category": "oils", "name": "5W20", "mode": "single", "new": 400, "used": 240 },
    # { "category": "oils", "name": "5W30", "mode": "single", "new": 300, "used": 456 },
    # { "category": "oils", "name": "5W40", "mode": "single", "new": 200, "used": 139 },
    # { "category": "oils", "name": "5W50", "mode": "single", "new": 278, "used": 390 },
    # { "category": "oils", "name": "5W60", "mode": "single", "new": 678, "used": 610 },

    # { "category": "oilfilters", "name": "7317", "mode": "single", "new": 910, "used": 104 },
    # { "category": "oilfilters", "name": "9688", "mode": "single", "new": 211, "used": 321 },
    # { "category": "oilfilters", "name": "6607", "mode": "single", "new": 821, "used": 512 },
    # { "category": "oilfilters", "name": "4967", "mode": "single", "new": 123, "used": 691 },
    # { "category": "oilfilters", "name": "3614", "mode": "single", "new": 340, "used": 899 },

    # { "category": "lightbulbs", "name": "9007", "mode": "single", "new": 821, "used": 100 },
    # { "category": "lightbulbs", "name": "1156", "mode": "single", "new": 712, "used": 811 },
    # { "category": "lightbulbs", "name": "1157", "mode": "single", "new": 312, "used": 123 },
    # { "category": "lightbulbs", "name": "7440", "mode": "single", "new": 421, "used": 789 },
    # { "category": "lightbulbs", "name": "2357", "mode": "single", "new": 890, "used": 760 },
    # { "category": "lightbulbs", "name": "3157", "mode": "single", "new": 139, "used": 10 },
    
    # { "category": "headlights", "name": "H11", "mode": "single", "new": 123, "used": 521 },
    # { "category": "headlights", "name": "H7", "mode": "single", "new": 381, "used": 640 },
    # { "category": "headlights", "name": "H1", "mode": "single", "new": 201, "used": 510 },
    # { "category": "headlights", "name": "9012", "mode": "single", "new": 710, "used": 650 },
    # { "category": "headlights", "name": "H13", "mode": "single", "new": 801, "used": 408 },

    { "category": "brakelines", "name": "3/8", "mode": "single", "new": 921, "used": 310 },
    { "category": "brakelines", "name": "5/16", "mode": "single", "new": 511, "used": 894 },
    { "category": "brakelines", "name": "1/4", "mode": "single", "new": 789, "used": 345 },

]

def inject_items():
    db: Session = SessionLocal()
    try:
        for item in items_data:
            # Check if tire already exists, if not, inset items_data to the database (db)
            existing = db.query(Item).filter(Item.name == item["name"]).first()
            if not existing:
                db.add(Item(category=item["category"], name=item["name"], mode=item["mode"], new=item["new"], used=item["used"]))
        db.commit()
        print("Items injected successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    inject_items()
