from models.base import Base
from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from novel import Novel

class Quote(Base):
    __tablename__ = "quote"

    id: Mapped[int] = mapped_column(primary_key=True)
    content: Mapped[str] = mapped_column(String(500))
    novel_id: Mapped[int] = mapped_column(ForeignKey("novel.id"))

    novel: Mapped["Novel"] = relationship(back_populates="quotes")