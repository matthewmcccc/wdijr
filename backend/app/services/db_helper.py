import os
import json
from app.parsers.epub import Epub
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from app.models.novel import Novel
from app.models.character import Character
from app.models.quote import Quote
from app.models.analysis import Analysis
from app.models.chapter import Chapter

db_path = os.path.join(os.path.dirname(__file__), "..", "..", "data", "app.db")
sync_engine = create_engine(f"sqlite:///{db_path}")


def save_analysis_to_db(
    title: str,
    author: str,
    characters: list,
    quotes: list,
    network: dict,
    summaries,
    char_mapping: dict,
    top_relationships,
    top_quotes,
    sentiment_values,
    inflection_points,
    plot_summaries,
    character_to_character_sentiment,
    chapters,
    chapter_summaries,
    chapter_conversational_networks,
    chapter_valence_vals,
    cooccurrence_frequency_network,
    has_cover=False,
):
    with Session(sync_engine) as session:
        novel = Novel(title=title, author=author)
        session.add(novel)
        session.flush()
        if has_cover:
            novel.cover_url = f"/data/{novel.id}/covers/cover.jpg"

        for i, char in enumerate(characters):
            name = char["name"]
            raw = summaries.get(i, "{}")
            try:
                if not raw.strip().startswith("{"):
                    raw = "{" + raw
                if not raw.strip().endswith("}"):
                    raw = raw + "}"
                summary_data = json.loads(raw)
            except (json.JSONDecodeError, Exception):
                summary_data = {"summary": "", "description": ""}

            top_quote = ""
            if len(top_quotes[name]) > 0:
                top_quote = top_quotes[name][0]["quote"]

            session.add(
                Character(
                    name=name,
                    summary=summary_data.get("summary", ""),
                    description=summary_data.get("description", ""),
                    novel_id=novel.id,
                    top_relationships=top_relationships.get(name, []),
                    top_quote=top_quote,
                )
            )

        analysis = Analysis(
            novel_id=novel.id,
            conversational_network=network,
            sentiment_values=sentiment_values,
            inflection_points=inflection_points,
            plot_summaries=plot_summaries,
            character_sentiment=character_to_character_sentiment,
            chapter_networks=chapter_conversational_networks,
            cooccurrence_network=[{"source": k[0], "target": k[1], "value": v} for k, v in cooccurrence_frequency_network.items()]
        )

        session.add(analysis)
        session.flush()

        for quote in quotes:
            content = quote["quote"]
            speaker = quote["speaker"]
            sentiment = quote["sentiment"]
            ch_number = quote["chapter_number"]
            if not speaker:
                continue
            char_id = char_mapping[speaker]
            session.add(
                Quote(
                    content=content,
                    novel_id=novel.id,
                    speaker=speaker,
                    character_id=char_id,
                    analysis_id=analysis.id,
                    sentiment=sentiment,
                    chapter_number=ch_number,
                )
            )
        for idx, chapter in chapters.items():
            try:
                chapter_summary = chapter_summaries[idx]
                if isinstance(chapter_summary, str):
                    chapter_summary = chapter_summary.strip()
                    if chapter_summary.startswith("```"):
                        chapter_summary = chapter_summary.split("\n", 1)[-1]
                    if chapter_summary.endswith("```"):
                        chapter_summary = chapter_summary.rsplit("```", 1)[0]
                    chapter_summary = chapter_summary.strip()
                    try:
                        chapter_summary = json.loads(chapter_summary, strict=False)
                    except json.JSONDecodeError as e:
                        chapter_summary = {"summary": "", "overview": ""}
            except json.JSONDecodeError:
                chapter_summary = {"summary": "", "overview": ""}

            session.add(
                Chapter(
                    chapter_number=idx,
                    title=chapter.title,
                    novel_id=novel.id,
                    summary=chapter_summary.get("summary", ""),
                    overview=chapter_summary.get("overview", ""),
                    sentiment=chapter_valence_vals[idx]
                )
            )

        session.flush()
        session.commit()
        return novel.id
