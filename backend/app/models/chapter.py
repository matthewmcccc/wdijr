import uuid
from .base import Base
from sqlalchemy import String, ForeignKey, select, Float, Text, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.ext.asyncio import AsyncSession

class Chapter(Base):
    __tablename__ = "chapter"

    id: Mapped[int] = mapped_column(primary_key=True)
    chapter_number: Mapped[int] = mapped_column(Integer)
    title: Mapped[str] = mapped_column(String(200))
    summary: Mapped[str] = mapped_column(Text, nullable=True)
    overview: Mapped[str] = mapped_column(Text, nullable=True)
    novel_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("novel.id"))    
    
    novel: Mapped["Novel"] = relationship(back_populates="chapters")

    @classmethod
    async def get_from_novel_id(cls, db: AsyncSession, novel_id: uuid.UUID):
        return (await db.execute(select(cls).where(cls.novel_id == novel_id))).scalars().all()
