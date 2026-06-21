from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
import os
import json
from src.schemas import notificaciones as schemas
from src.websockets import manager

try:
    from pywebpush import webpush, WebPushException
except ImportError:
    webpush = None
    WebPushException = Exception

router = APIRouter()

suscripciones_guardadas = []

@router.post("/notificaciones/suscribir", tags=["Notificaciones"])
def suscribir_notificacion(sub: schemas.PushSubscription):
    suscripciones_guardadas.append(sub.model_dump())
    return {"status": "ok", "mensaje": "Suscripción guardada en memoria."}

@router.post("/notificaciones/probar", tags=["Notificaciones"])
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
            vapid_claims={"sub": "mailto:admin@proyecto-chispita.com"}
        )
        return {"status": "ok", "mensaje": "Notificación enviada a la última suscripción registrada."}
    except WebPushException as ex:
        print("Error enviando Web Push:", ex)
        raise HTTPException(status_code=500, detail=str(ex))

@router.post("/api/estado-animo", tags=["Notificaciones"])
def enviar_estado_animo(req: schemas.EstadoAnimoRequest):
    if not webpush:
        raise HTTPException(status_code=500, detail="pywebpush no está instalado.")
    
    private_key = os.getenv("VAPID_PRIVATE_KEY")
    if not private_key:
        raise HTTPException(status_code=500, detail="Falta configurar VAPID_PRIVATE_KEY en el .env")

    target_user = "Chispita" if req.usuario == "Yescas" else "Yescas"

    sub_target = None
    for sub in reversed(suscripciones_guardadas):
        if sub.get("usuario") == target_user:
            sub_target = sub
            break
            
    if not sub_target:
        raise HTTPException(status_code=404, detail=f"Aún no hay suscripción activa para {target_user}.")

    try:
        payload = json.dumps({
            "title": f"Mensaje de {req.usuario}",
            "body": f"{req.estado}"
        })
        webpush(
            subscription_info=sub_target,
            data=payload,
            vapid_private_key=private_key,
            vapid_claims={"sub": "mailto:admin@proyecto-chispita.com"}
        )
        return {"status": "ok", "mensaje": "Estado de ánimo enviado exitosamente."}
    except WebPushException as ex:
        print("Error enviando estado de ánimo (Web Push):", ex)
        raise HTTPException(status_code=500, detail=str(ex))

@router.websocket("/ws/{usuario}")
async def websocket_endpoint(websocket: WebSocket, usuario: str):
    await manager.connect(websocket, usuario)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(usuario)
