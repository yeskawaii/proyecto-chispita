from sqlalchemy import Column, String, Integer, Float, Date, Time, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from src.core.db import Base

class Viaje(Base):
    __tablename__ = "viajes"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String, index=True)
    destino = Column(String)
    fecha_inicio = Column(Date)
    fecha_fin = Column(Date)
    presupuesto_estimado = Column(Float)
    estado = Column(String, default="planeacion")

    itinerarios = relationship("Itinerario", back_populates="viaje")
    gastos = relationship("Gasto", back_populates="viaje")

class Itinerario(Base):
    __tablename__ = "itinerarios"

    id = Column(Integer, primary_key=True, index=True)
    viaje_id = Column(Integer, ForeignKey("viajes.id"))
    tipo = Column(String) # Ej: vuelo, hotel, tour
    titulo = Column(String)
    fecha = Column(Date)
    hora_inicio = Column(Time, nullable=True)

    viaje = relationship("Viaje", back_populates="itinerarios")

class Gasto(Base):
    __tablename__ = "gastos"

    id = Column(Integer, primary_key=True, index=True)
    viaje_id = Column(Integer, ForeignKey("viajes.id"))
    concepto = Column(String)
    monto = Column(Float)
    fecha_pago = Column(Date)

    viaje = relationship("Viaje", back_populates="gastos")

class Tarea(Base):
    __tablename__ = "tareas"

    id = Column(Integer, primary_key=True, index=True)
    texto = Column(String, index=True)
    completada = Column(Boolean, default=False)