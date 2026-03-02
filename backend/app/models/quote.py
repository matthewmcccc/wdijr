from models.base import Base
from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

class Quote(Base):
    __tablename__ = "quote"

    id: Mapped[int] = mapped_column(primary_key=True)
    content: Mapped[str] = mapped_column(String(500))
    novel_id: Mapped[int] = mapped_column(ForeignKey("novel.id"))

    novel: Mapped["Novel"] = relationship(back_populates="quotes")