import uuid
from .base import Base
from sqlalchemy import String, ForeignKey, select, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.ext.asyncio import AsyncSession
from typing import TYPE_CHECKING

class Quote(Base):
    __tablename__ = "quote"

    id: Mapped[int] = mapped_column(primary_key=True)
    speaker: Mapped[str] = mapped_column(String(500))
    content: Mapped[str] = mapped_column(String(500))
    sentiment: Mapped[Float] = mapped_column(Float)
    novel_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("novel.id"))
    character_id: Mapped[int] = mapped_column(ForeignKey("character.id"))
    analysis_id: Mapped[int] = mapped_column(ForeignKey("analysis.id"))
    
    novel: Mapped["Novel"] = relationship(back_populates="quotes")
    character: Mapped["Character"] = relationship(back_populates="quotes")

    @classmethod
    async def get_from_novel_id(cls, db: AsyncSession, novel_id: uuid.UUID):
        return (await db.execute(select(cls).where(cls.novel_id == novel_id))).scalars().all()
