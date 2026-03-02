from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

SQLITE_DATABASE_URL = "sqlite:///./data/app.db"

engine = create_engine(
    SQLITE_DATABASE_URL, 
    connect_args={"check_same_thread": False},
    echo=True,
)

def create_db_and_tables():
    from models.novel import Base
    Base.metadata.create_all(engine)