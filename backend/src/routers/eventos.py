from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.core.db import get_db
from src.models.eventos import Evento
from src.schemas.eventos import EventoCreate, EventoResponse
from typing import List

router = APIRouter(prefix="/eventos", tags=["Eventos"])

@router.get("/", response_model=List[EventoResponse])
def get_eventos(db: Session = Depends(get_db)):
    return db.query(Evento).all()

@router.post("/", response_model=EventoResponse)
def crear_evento(evento: EventoCreate, db: Session = Depends(get_db)):
    nuevo_evento = Evento(**evento.model_dump())
    db.add(nuevo_evento)
    db.commit()
    db.refresh(nuevo_evento)
    return nuevo_evento

@router.delete("/{evento_id}")
def eliminar_evento(evento_id: int, db: Session = Depends(get_db)):
    evento = db.query(Evento).filter(Evento.id == evento_id).first()
    if not evento:
        raise HTTPException(status_code=404, detail="Ese evento no existe.")
    db.delete(evento)
    db.commit()
    return {"status": "ok", "mensaje": "Evento eliminado."}
