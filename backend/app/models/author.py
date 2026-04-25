import uuid
from sqlalchemy import String, ForeignKey, JSON, select, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship, MappedAsDataclass
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from .base import Base

class Author(MappedAsDataclass, Base):
    __tablename__ = "author"

    id: Mapped[int] = mapped_column(primary_key=True, init=False)
    name: Mapped[str] = mapped_column(String(100))
    description: Mapped[str] = mapped_column(Text)
    image_url: Mapped[str] = mapped_column(Text)
    other_works: Mapped[list] = mapped_column(JSON, nullable=True)
    novel_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("novel.id"))

    novel: Mapped["Novel"] = relationship(back_populates="author_details", init=False)

    @classmethod
    async def get_from_novel_id(cls, db: AsyncSession, novel_id: int):
        return (
            (await db.execute(select(cls).where(cls.novel_id == novel_id)))
            .scalars()
            .first()
        )
