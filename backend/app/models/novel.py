import uuid
from typing import List
from sqlalchemy import String, select, types
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.ext.asyncio import AsyncSession
from typing import TYPE_CHECKING
from .character import Character
from .base import Base

class Novel(Base):
    __tablename__ = "novel"

    id: Mapped[uuid.UUID] = mapped_column(
        types.Uuid,
        primary_key=True,
        default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(String(100))
    author: Mapped[str] = mapped_column(String(50))
    cover_url: Mapped[str] = mapped_column(String(500), nullable=True)
    quotes: Mapped[List["Quote"]] = relationship(back_populates="novel")
    characters: Mapped[List["Character"]] = relationship(back_populates="novel")
    analysis: Mapped["Analysis"] = relationship(back_populates="novel")

    @classmethod
    async def get_from_id(cls, id: uuid.UUID, db: AsyncSession):
        return (await db.execute(select(cls).where(cls.id == id))).scalar_one()
    