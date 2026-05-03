# SQLAlchemy models --> Database Layer

'''
Purpose: define the structure of your database tables.

These classes map Python objects → database rows (ORM = Object-Relational Mapping).

Each class corresponds to a table in your database.

'''

from email.policy import default
from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from db import Base

class Log(Base):
    __tablename__ = "logs"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

# NOTE: DO NOT NEED THIS ANYMORE (Since we are now using the Item as the generic class for all inventory items)
class Tire(Base):
    __tablename__ = "tires"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    new = Column(Integer, nullable=False)
    used = Column(Integer, nullable=False)

# NOTE: Generic class that will change implementation based on what prop is passed into it
class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, index=True) # tire, oil, oilfilter, lightbulb, etc. -> No duplicated tables or endpoints
    name = Column(String, unique=True, nullable=False)
    mode = Column(String, default="single") # "single" or "dual" --> if dual: incorporates both 'new' and 'used'
    new = Column(Integer, default=0)
    used = Column(Integer, default=0)
    # threshold = Column(Integer, default=10) # <-- threshold for alerts

class Threshold(Base):
    __tablename__ = "threshold"

    id = Column(Integer, primary_key = True, index = True)
    value = Column(Integer, nullable = False)