from sqlalchemy import Column, String, Integer, Date, Time
from src.core.db import Base

class Evento(Base):
    __tablename__ = "eventos"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String, index=True)
    fecha = Column(Date)
    hora_inicio = Column(Time, nullable=True)
    hora_fin = Column(Time, nullable=True)
    autor = Column(String)  # 'Yescas' o 'Chispita'
    tipo = Column(String, default="event")  # 'event' o 'trip'
