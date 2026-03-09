import uuid
from sqlalchemy import String, ForeignKey, JSON, select
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from .base import Base

class Analysis(Base):
    __tablename__ = "analysis"

    id: Mapped[int] = mapped_column(primary_key=True)
    network: Mapped[dict] = mapped_column(JSON)
    novel_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("novel.id"))
    
    novel: Mapped["Novel"] = relationship(back_populates="analysis")
    
    @classmethod
    async def get_from_novel_id(cls, db: AsyncSession, id: int):
        return (await db.execute(select(cls).where(cls.novel_id == id))).scalar_one()
