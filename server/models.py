# SQLAlchemy models --> Database Layer


'''
Purpose: define the structure of your database tables.

These classes map Python objects → database rows (ORM = Object-Relational Mapping).

Each class corresponds to a table in your database.

'''

from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from db import Base

class Log(Base):
    __tablename__ = "logs"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Tire(Base):
    __tablename__ = "tires"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    new = Column(Integer, nullable=False)
    used = Column(Integer, nullable=False)

# NOTE: Generic class that will change implementation based on what prop is passed into it
# class Item(Base):
#     __tablename__ = "items"

#     id = Column(Integer, primary_key=True, index=True)
#     category = Column(String, index=True) # tire, oil, oilfilter, lightbulb, etc. -> No duplicated tables or endpoints
#     name = Column(String, unique=True, nullable=False)
#     new = Column(Integer, nullable=False)
#     used = Column(Integer, nullable=False)


class Threshold(Base):
    __tablename__ = "threshold"

    id = Column(Integer, primary_key = True, index = True)
    value = Column(Integer, nullable = False)