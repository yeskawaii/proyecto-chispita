from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import json

from src.core.db import get_db
from src.models import tareas as models
from src.schemas import tareas as schemas
from src.websockets import manager

router = APIRouter()

@router.get("/api/tareas", response_model=List[schemas.TareaResponse], tags=["Tareas Compartidas"])
def obtener_tareas(db: Session = Depends(get_db)):
    return db.query(models.Tarea).order_by(models.Tarea.id.asc()).all()

@router.post("/api/tareas", response_model=schemas.TareaResponse, tags=["Tareas Compartidas"])
async def crear_tarea(tarea: schemas.TareaCreate, db: Session = Depends(get_db)):
    nueva_tarea = models.Tarea(**tarea.model_dump())
    db.add(nueva_tarea)
    db.commit()
    db.refresh(nueva_tarea)
    await manager.broadcast(json.dumps({"tipo": "ACTUALIZACION_TAREAS"}))
    return nueva_tarea

@router.put("/api/tareas/{tarea_id}", response_model=schemas.TareaResponse, tags=["Tareas Compartidas"])
async def actualizar_tarea(tarea_id: int, tarea: schemas.TareaUpdate, db: Session = Depends(get_db)):
    db_tarea = db.query(models.Tarea).filter(models.Tarea.id == tarea_id).first()
    if not db_tarea:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")
    
    if tarea.texto is not None:
        db_tarea.texto = tarea.texto
    if tarea.completada is not None:
        db_tarea.completada = tarea.completada
        
    db.commit()
    db.refresh(db_tarea)
    await manager.broadcast(json.dumps({"tipo": "ACTUALIZACION_TAREAS"}))
    return db_tarea

@router.delete("/api/tareas/{tarea_id}", tags=["Tareas Compartidas"])
async def eliminar_tarea(tarea_id: int, db: Session = Depends(get_db)):
    db_tarea = db.query(models.Tarea).filter(models.Tarea.id == tarea_id).first()
    if not db_tarea:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")
    db.delete(db_tarea)
    db.commit()
    await manager.broadcast(json.dumps({"tipo": "ACTUALIZACION_TAREAS"}))
    return {"status": "ok", "mensaje": "Tarea eliminada"}
