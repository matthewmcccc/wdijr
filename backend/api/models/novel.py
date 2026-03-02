from sqlalchemy import String
from sqlalchemy import ForeignKey
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship

class Base(DeclarativeBase):
    pass

class Novel(Base):
    __tablename__ = "novel"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(100))
    author: Mapped[str] = mapped_column(String(50))


class Quote(Base):
    __tablename__ = "quotes"

    id: Mapped[int] = mapped_column(primary_key=True)
    content: Mapped[str] = mapped_column(String(500))
    novel_id: Mapped[int] = mapped_column(ForeignKey("novel.id"))

    novel: Mapped["Novel"] = relationship(back_populates="quotes")


class Analysis(Base):
    __tablename__ = "analysis"

    id: Mapped[int] = mapped_column(primary_key=True)
    novel_id: Mapped[int] = mapped_column(ForeignKey("novel.id"))

    novel: Mapped["Novel"] = relationship(back_populates="quotes")