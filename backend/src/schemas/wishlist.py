from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class WishlistIdeaBase(BaseModel):
    title: str
    description: Optional[str] = None
    budget_tier: int

class WishlistIdeaCreate(WishlistIdeaBase):
    pass

class WishlistIdeaResponse(WishlistIdeaBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
