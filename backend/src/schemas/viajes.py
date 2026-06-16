from pydantic import BaseModel
from datetime import date
from typing import Optional
from datetime import date, time

# ==========================================
# 1. ESQUEMAS DE VIAJES (BASE)
# ==========================================
class ViajeBase(BaseModel):
    titulo: str
    destino: str
    fecha_inicio: date
    fecha_fin: date
    presupuesto_estimado: float

class ViajeCreate(ViajeBase):
    pass

class ViajeResponse(ViajeBase):
    id: int
    estado: str

    class Config:
        from_attributes = True


# ==========================================
# 2. ESQUEMAS DE ITINERARIOS
# ==========================================
class ItinerarioBase(BaseModel):
    tipo: str
    titulo: str
    fecha: date
    hora_inicio: Optional[time] = None

class ItinerarioCreate(ItinerarioBase):
    viaje_id: int

class ItinerarioResponse(ItinerarioBase):
    id: int
    viaje_id: int

    class Config:
        from_attributes = True


# ==========================================
# 3. ESQUEMAS DE GASTOS
# ==========================================
class GastoBase(BaseModel):
    concepto: str
    monto: float
    fecha_pago: date

class GastoCreate(GastoBase):
    viaje_id: int

class GastoResponse(GastoBase):
    id: int
    viaje_id: int

    class Config:
        from_attributes = True


# ==========================================
# 4. ESQUEMA COMPLETO (ANIDADO)
# ==========================================

class ViajeResponseFull(ViajeResponse):
    itinerarios: list[ItinerarioResponse] = []
    gastos: list[GastoResponse] = []