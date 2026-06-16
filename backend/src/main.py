from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from src.core.db import engine, Base, get_db
from src.models import viajes as models
from src.schemas import viajes as schemas

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Chispita API", version="1.0.0")

@app.get("/")
def home():
    return {"status": "ok", "mensaje": "Servidor de Yescas jalando al cien."}

# ==========================================
# ENDPOINTS: VIAJES
# ==========================================

@app.post("/viajes/", response_model=schemas.ViajeResponse, tags=["Viajes"])
def crear_viaje(viaje: schemas.ViajeCreate, db: Session = Depends(get_db)):
    nuevo_viaje = models.Viaje(**viaje.model_dump())
    db.add(nuevo_viaje)
    db.commit()
    db.refresh(nuevo_viaje)
    return nuevo_viaje

@app.get("/viajes/", response_model=List[schemas.ViajeResponse], tags=["Viajes"])
def obtener_viajes(db: Session = Depends(get_db)):
    return db.query(models.Viaje).all()

@app.get("/viajes/{viaje_id}", response_model=schemas.ViajeResponseFull, tags=["Viajes"])
def obtener_viaje_completo(viaje_id: int, db: Session = Depends(get_db)):
    viaje = db.query(models.Viaje).filter(models.Viaje.id == viaje_id).first()
    if not viaje:
        raise HTTPException(status_code=404, detail="Ese viaje no existe, compa.")
    return viaje


# ==========================================
# ENDPOINTS: ITINERARIO
# ==========================================

@app.post("/itinerarios/", response_model=schemas.ItinerarioResponse, tags=["Itinerarios"])
def agregar_itinerario(item: schemas.ItinerarioCreate, db: Session = Depends(get_db)):
    # Validar primero si el viaje existe
    viaje_existe = db.query(models.Viaje).filter(models.Viaje.id == item.viaje_id).first()
    if not viaje_existe:
        raise HTTPException(status_code=404, detail="No puedes meter itinerario a un viaje que no existe.")
    
    nuevo_item = models.Itinerario(**item.model_dump())
    db.add(nuevo_item)
    db.commit()
    db.refresh(nuevo_item)
    return nuevo_item


# ==========================================
# ENDPOINTS: GASTOS
# ==========================================

@app.post("/gastos/", response_model=schemas.GastoResponse, tags=["Gastos"])
def agregar_gasto(gasto: schemas.GastoCreate, db: Session = Depends(get_db)):
    viaje_existe = db.query(models.Viaje).filter(models.Viaje.id == gasto.viaje_id).first()
    if not viaje_existe:
        raise HTTPException(status_code=404, detail="No puedes registrar gastos de un viaje fantasma.")
    
    nuevo_gasto = models.Gasto(**gasto.model_dump())
    db.add(nuevo_gasto)
    db.commit()
    db.refresh(nuevo_gasto)
    return nuevo_gasto