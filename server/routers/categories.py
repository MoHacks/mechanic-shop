from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db import get_db
from models import Category
from schemas import Category as CategorySchema, CategoryCreate

router = APIRouter(prefix="/categories", tags=["Categories"])

@router.get("/", response_model=list[CategorySchema])
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()

@router.post("/", response_model=CategorySchema)
def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    existing = db.query(Category).filter(Category.name == category.name).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Category '{category.name}' already exists")
    new_cat = Category(name=category.name, color_start=category.color_start, color_end=category.color_end)
    db.add(new_cat)
    db.commit()
    db.refresh(new_cat)
    return new_cat

@router.delete("/{name}")
def delete_category(name: str, db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.name == name).first()
    if not category:
        raise HTTPException(status_code=404, detail=f"Category '{name}' not found")
    db.delete(category)
    db.commit()
    return {"message": f"Category '{name}' deleted"}
