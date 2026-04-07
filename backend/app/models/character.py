import uuid
from .base import Base
from sqlalchemy import String, ForeignKey, select, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.ext.asyncio import AsyncSession
from typing import TYPE_CHECKING, List

if TYPE_CHECKING:
    from novel import Novel
    from quote import Quote


class Character(Base):
    __tablename__ = "character"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50))
    summary: Mapped[str] = mapped_column(String(5000))
    description: Mapped[str] = mapped_column(String(1000))
    top_relationships = mapped_column(JSON, nullable=True)
    top_quote: Mapped[str] = mapped_column(String(200))
    novel_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("novel.id"))
    image_url: Mapped[str] = mapped_column(String(500), nullable=True)

    novel: Mapped["Novel"] = relationship(back_populates="characters")
    quotes: Mapped[List["Quote"]] = relationship(back_populates="character")

    @classmethod
    async def get_from_novel_id(cls, db: AsyncSession, id: str):
        return (await db.execute(select(cls).where(cls.novel_id == id))).scalars().all()

    @classmethod
    async def get_from_name(cls, db: AsyncSession, name: str):
        return (await db.execute(select(cls).where(cls.name == name))).scalar_one()
