from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from src.core.db import get_db
from src.models import wishlist as models
from src.schemas import wishlist as schemas

router = APIRouter()

@router.get("/api/wishlist", response_model=List[schemas.WishlistIdeaResponse], tags=["Wishlist de Citas"])
def obtener_ideas(db: Session = Depends(get_db)):
    return db.query(models.WishlistIdea).order_by(models.WishlistIdea.created_at.desc()).all()

@router.post("/api/wishlist", response_model=schemas.WishlistIdeaResponse, tags=["Wishlist de Citas"])
def crear_idea(idea: schemas.WishlistIdeaCreate, db: Session = Depends(get_db)):
    if not idea.title or idea.budget_tier not in [1, 2, 3, 4]:
        raise HTTPException(status_code=400, detail="Título inválido o budget_tier fuera de rango (1-4)")
    
    nueva_idea = models.WishlistIdea(
        title=idea.title,
        description=idea.description,
        budget_tier=idea.budget_tier
    )
    db.add(nueva_idea)
    db.commit()
    db.refresh(nueva_idea)
    return nueva_idea

@router.delete("/api/wishlist/{idea_id}", tags=["Wishlist de Citas"])
def eliminar_idea(idea_id: int, db: Session = Depends(get_db)):
    db_idea = db.query(models.WishlistIdea).filter(models.WishlistIdea.id == idea_id).first()
    if not db_idea:
        raise HTTPException(status_code=404, detail="Idea no encontrada")
    
    db.delete(db_idea)
    db.commit()
    return {"status": "ok", "mensaje": "Idea eliminada de la wishlist"}
