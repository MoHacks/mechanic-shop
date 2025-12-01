# inject_tires.py
# from sqlalchemy.orm import Session
from db import SessionLocal, engine, Base
from models import Threshold

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)