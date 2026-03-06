from sqlalchemy import String, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, Optional
from .base import Base

class Analysis(Base):
    __tablename__ = "analysis"

    id: Mapped[int] = mapped_column(primary_key=True)
    network: Mapped[dict] = mapped_column(JSON)
    novel_id: Mapped[int] = mapped_column(ForeignKey("novel.id"))
    
    novel: Mapped["Novel"] = relationship(back_populates="analysis")