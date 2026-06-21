from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.core.db import engine, Base

from src.models import viajes, tareas
Base.metadata.create_all(bind=engine)

# Importar routers
from src.routers import viajes as router_viajes
from src.routers import tareas as router_tareas
from src.routers import notificaciones as router_notificaciones

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

app.include_router(router_viajes.router)
app.include_router(router_tareas.router)
app.include_router(router_notificaciones.router)