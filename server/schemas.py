'''
pydantic protects data that's coming into your fully-typed Python application. 
It ensures everything is accurate and valid.

This is called "Type annotations": explicitly state the expected data type of 
variables, function parameters, and return values

Purpose: define how data is sent/received via the API.

Pydantic validates incoming data and shapes outgoing data.

'''

from unicodedata import category
from pydantic import BaseModel

# Common fields shared between requests/responses
class TireBase(BaseModel):
    name: str
    new: int
    used: int

# Needed due to 'Seperation of Concern': Specific to creation requests — what the client sends when adding a tire
class TireCreate(TireBase):
    pass

# Response model — includes id and orm_mode for database objects
# The Config tells Pydantic:
# “You are allowed to create this Pydantic model from object attributes, not just from dictionaries.”
class Tire(TireBase):
    id: int
    class Config:
        from_attributes = True


class CategoryBase(BaseModel):
    name: str
    color_start: str
    color_end: str

class CategoryCreate(CategoryBase):
    pass

class Category(CategoryBase):
    id: int
    class Config:
        from_attributes = True

class ThresholdBase(BaseModel):
    value: int

class ThresholdUpdate(ThresholdBase):
    pass

class Threshold(ThresholdBase):
    id: int
    category: str
    class Config:
        from_attributes = True # allows SQLAlchemy ORM → Pydantic conversion


class Item(BaseModel):
    category: str
    name: str
    mode: str
    new: int
    used: int

class ItemCreate(Item):
    pass