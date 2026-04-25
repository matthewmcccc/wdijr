import uuid
from sqlalchemy import String, ForeignKey, JSON, select
from sqlalchemy.orm import Mapped, mapped_column, relationship, MappedAsDataclass
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from .base import Base


class Analysis(MappedAsDataclass, Base):
    __tablename__ = "analysis"

    id: Mapped[int] = mapped_column(primary_key=True, init=False)
    conversational_network: Mapped[dict] = mapped_column(JSON)
    cooccurrence_network: Mapped[dict] = mapped_column(JSON, nullable=True)
    sentiment_values: Mapped[list | None] = mapped_column(JSON, nullable=True)
    chapter_cooccurrence_network: Mapped[dict] = mapped_column(JSON, nullable=True)
    character_chapter_occurences: Mapped[dict] = mapped_column(JSON, nullable=True)
    inflection_points: Mapped[list | None] = mapped_column(JSON, nullable=True)
    plot_summaries: Mapped[list | None] = mapped_column(JSON, nullable=True)
    novel_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("novel.id"))
    character_sentiment: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    chapter_networks: Mapped[dict] = mapped_column(JSON)
    motifs: Mapped[dict] = mapped_column(JSON, nullable=True)
    lexical_richness: Mapped[dict] = mapped_column(JSON, nullable=True)

    novel: Mapped["Novel"] = relationship(back_populates="analysis", init=False, lazy="raise_on_sql")

    @classmethod
    async def get_from_novel_id(cls, db: AsyncSession, id: int):
        return (await db.execute(select(cls).where(cls.novel_id == id))).scalar_one()
