# SQLAlchemy models --> Database Layer

'''
Purpose: define the structure of your database tables.

These classes map Python objects → database rows (ORM = Object-Relational Mapping).

Each class corresponds to a table in your database.

'''

from sqlalchemy import Column, Integer, String, DateTime, UniqueConstraint
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
    __table_args__ = (UniqueConstraint('name', 'category', name='uq_item_name_category'),)

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, index=True)
    name = Column(String, nullable=False)
    mode = Column(String, default="single") # "single" or "dual" --> if dual: incorporates both 'new' and 'used'
    new = Column(Integer, default=0)
    used = Column(Integer, default=0)
    # threshold = Column(Integer, default=10) # <-- threshold for alerts

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    color_start = Column(String, nullable=False)
    color_end = Column(String, nullable=False)

class Threshold(Base):
    __tablename__ = "threshold"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, nullable=False, unique=True)
    value = Column(Integer, nullable=False)