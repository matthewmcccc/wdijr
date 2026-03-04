from models.base import Base
from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING

class Quote(Base):
    __tablename__ = "quote"

    id: Mapped[int] = mapped_column(primary_key=True)
    content: Mapped[str] = mapped_column(String(500))
    novel_id: Mapped[int] = mapped_column(ForeignKey("novel.id"))
    character_id: Mapped[int] = mapped_column(ForeignKey("character.id"))
    analysis_id: Mapped[int] = mapped_column(ForeignKey("analysis.id"))

    novel: Mapped["Novel"] = relationship(back_populates="quotes")
    character: Mapped["Character"] = relationship(back_populates="quotes")
    analysis: Mapped["Analysis"] = relationship(back_populates="quotes")