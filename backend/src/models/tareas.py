from sqlalchemy import Column, String, Integer, Boolean
from src.core.db import Base

class Tarea(Base):
    __tablename__ = "tareas"

    id = Column(Integer, primary_key=True, index=True)
    texto = Column(String, index=True)
    completada = Column(Boolean, default=False)
