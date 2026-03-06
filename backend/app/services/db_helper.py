import os
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from app.models.novel import Novel
from app.models.character import Character
from app.models.quote import Quote
from app.models.analysis import Analysis

db_path = os.path.join(os.path.dirname(__file__), "..", "data", "app.db")
sync_engine = create_engine(f"sqlite:///{db_path}")

def save_analysis_to_db(title: str, author: str, characters: list, quotes: list, network: dict):
    with Session(sync_engine) as session:
        novel = Novel(title=title, author=author)
        session.add(novel)
        session.flush()

        for char in characters:
            session.add(Character(
                name=char["name"],
                summary="",
                description="",
                novel_id=novel.id
            ))

        for quote in quotes:
            session.add(Quote(
                content=quote["quote"],
                novel_id=novel.id,
            ))

        session.add(Analysis(
            novel_id=novel.id,
            network=network
        ))

        session.commit()
        return novel.id
