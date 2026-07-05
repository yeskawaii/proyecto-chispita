from pydantic import BaseModel
from datetime import date, time
from typing import Optional

class EventoBase(BaseModel):
    titulo: str
    fecha: date
    hora_inicio: Optional[time] = None
    hora_fin: Optional[time] = None
    autor: str
    tipo: str = "event"

class EventoCreate(EventoBase):
    pass

class EventoResponse(EventoBase):
    id: int

    class Config:
        from_attributes = True
