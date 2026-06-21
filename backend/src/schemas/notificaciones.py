from pydantic import BaseModel
from typing import Optional

class PushKeys(BaseModel):
    p256dh: str
    auth: str

class PushSubscription(BaseModel):
    endpoint: str
    keys: PushKeys
    usuario: Optional[str] = None

class EstadoAnimoRequest(BaseModel):
    usuario: str
    estado: str
