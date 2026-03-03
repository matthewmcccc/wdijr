from typing import List
from models.base import Base
from sqlalchemy import String, select
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.ext.asyncio import AsyncSession
from typing import TYPE_CHECKING
from models.quote import Quote
from models.character import Character

class Novel(Base):
    __tablename__ = "novel"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(100))
    author: Mapped[str] = mapped_column(String(50))

    quotes: Mapped[List["Quote"]] = relationship(back_populates="novel")
    characters: Mapped[List["Character"]] = relationship(back_populates="novel")