from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
import os

try:
    from pywebpush import webpush, WebPushException
except ImportError:
    webpush = None
    WebPushException = Exception

from src.core.db import engine, Base, get_db
from src.models import viajes as models
from src.schemas import viajes as schemas
from src.services.ai import generar_ideas_viaje
from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Chispita API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.delete("/viajes/{viaje_id}", tags=["Viajes"])
def eliminar_viaje(viaje_id: int, db: Session = Depends(get_db)):
    viaje = db.query(models.Viaje).filter(models.Viaje.id == viaje_id).first()
    if not viaje:
        raise HTTPException(status_code=404, detail="Ese viaje no existe.")
    db.delete(viaje)
    db.commit()
    return {"status": "ok", "mensaje": "Viaje eliminado."}


# ==========================================
# ENDPOINTS: ITINERARIO
# ==========================================

@app.post("/viajes/{viaje_id}/itinerario", response_model=schemas.ItinerarioResponse, tags=["Itinerarios"])
def crear_itinerario(viaje_id: int, itinerario: schemas.ItinerarioCreate, db: Session = Depends(get_db)):
    viaje = db.query(models.Viaje).filter(models.Viaje.id == viaje_id).first()
    if not viaje:
        raise HTTPException(status_code=404, detail="No puedes meterle agenda a un viaje fantasma.")
    
    data = itinerario.model_dump()
    data["viaje_id"] = viaje_id
    
    nuevo_item = models.Itinerario(**data)
    db.add(nuevo_item)
    db.commit()
    db.refresh(nuevo_item)
    return nuevo_item

@app.get("/viajes/{viaje_id}/itinerario", response_model=List[schemas.ItinerarioResponse], tags=["Itinerarios"])
def obtener_itinerario(viaje_id: int, db: Session = Depends(get_db)):
    viaje = db.query(models.Viaje).filter(models.Viaje.id == viaje_id).first()
    if not viaje:
        raise HTTPException(status_code=404, detail="Ese viaje no existe, compa.")
        
    return db.query(models.Itinerario)\
        .filter(models.Itinerario.viaje_id == viaje_id)\
        .order_by(models.Itinerario.fecha.asc(), models.Itinerario.hora_inicio.asc())\
        .all()

@app.delete("/viajes/{viaje_id}/itinerario/{item_id}", tags=["Itinerarios"])
def eliminar_itinerario(viaje_id: int, item_id: int, db: Session = Depends(get_db)):
    item = db.query(models.Itinerario).filter(models.Itinerario.id == item_id, models.Itinerario.viaje_id == viaje_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Ese itinerario no existe.")
    db.delete(item)
    db.commit()
    return {"status": "ok", "mensaje": "Itinerario eliminado."}

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

@app.get("/viajes/{viaje_id}/gastos/", response_model=List[schemas.GastoResponse], tags=["Gastos"])
def obtener_gastos_viaje(viaje_id: int, db: Session = Depends(get_db)):
    viaje = db.query(models.Viaje).filter(models.Viaje.id == viaje_id).first()
    if not viaje:
        raise HTTPException(status_code=404, detail="Ese viaje no existe.")
    
    gastos = db.query(models.Gasto).filter(models.Gasto.viaje_id == viaje_id).all()
    return gastos

@app.delete("/gastos/{gasto_id}", tags=["Gastos"])
def eliminar_gasto(gasto_id: int, db: Session = Depends(get_db)):
    gasto = db.query(models.Gasto).filter(models.Gasto.id == gasto_id).first()
    if not gasto:
        raise HTTPException(status_code=404, detail="Ese gasto no existe.")
    db.delete(gasto)
    db.commit()
    return {"status": "ok", "mensaje": "Gasto eliminado."}

# ==========================================
# ENDPOINTS: IA / IDEAS
# ==========================================

@app.get("/viajes/{viaje_id}/ideas", tags=["IA"])
def obtener_ideas_con_ia(viaje_id: int, db: Session = Depends(get_db)):
    viaje = db.query(models.Viaje).filter(models.Viaje.id == viaje_id).first()
    if not viaje:
        raise HTTPException(status_code=404, detail="Viaje no encontrado.")

    dias = (viaje.fecha_fin - viaje.fecha_inicio).days
    if dias <= 0:
        dias = 1

    ideas = generar_ideas_viaje(viaje.destino, dias, viaje.presupuesto_estimado)

    return {
        "destino": viaje.destino,
        "dias": dias,
        "presupuesto": viaje.presupuesto_estimado,
        "ideas_gemini": ideas
    }

# ==========================================
# ENDPOINTS: PUSH NOTIFICATIONS
# ==========================================

class PushKeys(BaseModel):
    p256dh: str
    auth: str

class PushSubscription(BaseModel):
    endpoint: str
    keys: PushKeys
    usuario: Optional[str] = None

# Almacenamiento en memoria temporal para las suscripciones
suscripciones_guardadas = []

@app.post("/notificaciones/suscribir", tags=["Notificaciones"])
def suscribir_notificacion(sub: PushSubscription):
    suscripciones_guardadas.append(sub.model_dump())
    return {"status": "ok", "mensaje": "Suscripción guardada en memoria."}

@app.post("/notificaciones/probar", tags=["Notificaciones"])
def probar_notificacion():
    if not webpush:
        raise HTTPException(status_code=500, detail="pywebpush no está instalado.")
    if not suscripciones_guardadas:
        raise HTTPException(status_code=400, detail="No hay suscripciones guardadas.")
    
    private_key = os.getenv("VAPID_PRIVATE_KEY")
    if not private_key:
        raise HTTPException(status_code=500, detail="Falta configurar VAPID_PRIVATE_KEY en el .env")
        
    sub = suscripciones_guardadas[-1]
    
    try:
        webpush(
            subscription_info=sub,
            data='{"title": "¡Hola!", "body": "Esta es una notificación de prueba desde FastAPI."}',
            vapid_private_key=private_key,
            vapid_claims={
                "sub": "mailto:admin@proyecto-chispita.com"
            }
        )
        return {"status": "ok", "mensaje": "Notificación enviada a la última suscripción registrada."}
    except WebPushException as ex:
        print("Error enviando Web Push:", ex)
        raise HTTPException(status_code=500, detail=str(ex))