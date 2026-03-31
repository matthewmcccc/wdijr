import os
import json
import serpapi
import requests
from urllib.parse import urlparse
from dotenv import load_dotenv
from app.parsers.epub import Epub
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from app.models.novel import Novel
from app.models.character import Character
from app.models.quote import Quote
from app.models.analysis import Analysis
from app.models.chapter import Chapter
from app.models.author import Author

load_dotenv()

db_path = os.path.join(os.path.dirname(__file__), "..", "..", "data")
sync_engine = create_engine(f"sqlite:///{os.path.join(db_path, 'app.db')}")

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
    author_details,
    motifs,
    lexical_richness,
    novel_description,
    has_cover=False,
):
    with Session(sync_engine) as session:
        novel = Novel(title=title, author=author, description=novel_description if novel_description else None)
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

            # try:
            #     api_key = os.getenv("SERP_API_KEY")
            # except Exception as e:
            #     print(f"Couldn't grab api key: {e}")
            # client = serpapi.Client(
            #     api_key=api_key
            # )
            # n_title = title.replace("'s", " ")
            # results = client.search({
            #     "engine": "google_images",
            #     "q": f"{name} {n_title.lower()} illustration",
            #     "location": "United Kingdom",
            #     "google_domain": "google.com",
            #     "hl": "en",
            #     "gl": "us",
            #     "device": "desktop"
            # })

            # data_dir = os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", str(novel.id), "character_thumbnails")
            # os.makedirs(data_dir, exist_ok=True)

            # ext = ""
            # try:
            #     image_results = results["images_results"]
            #     image = image_results[0]["thumbnail"]
            #     path = urlparse(image).path
            #     ext = os.path.splitext(path)[1]
            #     with open(f"{data_dir}/{name}{ext}", 'wb') as handler:
            #         handler.write(requests.get(image).content)
            # except Exception as e:
            #     print(f"Couldn't grab image from results: {e}")

            session.add(
                Character(
                    name=name,
                    summary=summary_data.get("summary", ""),
                    description=summary_data.get("description", ""),
                    novel_id=novel.id,
                    top_relationships=top_relationships.get(name, []),
                    top_quote=top_quote,
                    image_url=None,
                )
            )

        analysis = Analysis(
            novel_id=novel.id,
            conversational_network=network,
            sentiment_values=sentiment_values,
            inflection_points=inflection_points,
            plot_summaries=list(plot_summaries),
            character_sentiment=character_to_character_sentiment,
            chapter_networks=chapter_conversational_networks,
            motifs=motifs,
            cooccurrence_network=cooccurrence_frequency_network,
            lexical_richness=lexical_richness
        )

        author_obj = Author(
            name=str(author),
            description=author_details["description"],
            image_url=author_details["image_url"],
            novel_id=novel.id,
            other_works=author_details["other_works"]
        )

        session.add(author_obj)
        session.flush()
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
