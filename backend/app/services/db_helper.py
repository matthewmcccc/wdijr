import os
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from models.novel import Novel
from models.character import Character
from models.quote import Quote
from models.analysis import Analysis

db_path = os.path.join(os.path.dirname(__file__), "..", "data", "app.db")
sync_engine = create_engine(f"sqlite:///{db_path}")

def save_analysis_to_db(title: str, author: str, characters: list, quotes: list, network: dict, char_mapping: dict):
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

        analysis = Analysis(
            novel_id=novel.id,
            network=network
        )

        session.add(analysis)
        session.flush()

        for quote in quotes:
            content = quote["quote"]
            speaker = quote["speaker"]
            if speaker is None:
                continue
            char_id = char_mapping[speaker]
            session.add(Quote(
                content=content,
                novel_id=novel.id,
                character_id=char_id,
                analysis_id=analysis.id
            ))

        session.commit()
        return novel.id
