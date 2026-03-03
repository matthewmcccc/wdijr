from models.base import Base
from sqlalchemy import String, ForeignKey, select
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.ext.asyncio import AsyncSession
from typing import TYPE_CHECKING, List
if TYPE_CHECKING:
    from novel import Novel
    from quote import Quote

class Character(Base):
    __tablename__ = "character"

    id: Mapped[int] = mapped_column(primary_key=True)
    first_name: Mapped[str] = mapped_column(String(50))
    surname: Mapped[str] = mapped_column(String(50))
    description: Mapped[str] = mapped_column(String(1000))
    novel_id: Mapped[int] = mapped_column(ForeignKey("novel.id"))

    novel: Mapped["Novel"] = relationship(back_populates="characters")
    quotes: Mapped[List["Quote"]] = relationship(back_populates="character")

    @classmethod
    async def get_from_novel_id(cls, db: AsyncSession, id: str):
        return (await db.execute(select(cls).where(cls.novel_id == id))).scalars().all()