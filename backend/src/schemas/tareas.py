from pydantic import BaseModel
from typing import Optional

class TareaBase(BaseModel):
    texto: str
    completada: bool = False

class TareaCreate(TareaBase):
    pass

class TareaUpdate(BaseModel):
    texto: Optional[str] = None
    completada: Optional[bool] = None

class TareaResponse(TareaBase):
    id: int

    class Config:
        from_attributes = True
