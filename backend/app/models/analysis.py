from sqlalchemy import String, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, Optional
from .base import Base
from .quote import Quote

class Analysis(Base):
    id: Mapped[int] = mapped_column(primary_key=True)
    novel_id: Mapped[int] = mapped_column(ForeignKey("novel.id"))
    quotes: Mapped[List["Quote"]] = relationship(back_populates="analysis")