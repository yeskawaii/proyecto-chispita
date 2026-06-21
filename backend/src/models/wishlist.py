from sqlalchemy import Column, Integer, String, Text, DateTime
from src.core.db import Base
from datetime import datetime

class WishlistIdea(Base):
    __tablename__ = "wishlist_ideas"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text, nullable=True)
    budget_tier = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
