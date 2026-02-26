from collections import defaultdict
import io
import json
from pathlib import Path
from parsers.epub import Epub
from nlp.ner import EntityExtractor
from nlp.plot_sentiment import PlotSentiment
from llm.gemini import Gemini

if __name__ == "__main__":
    book_path = Path("./temp/wh.epub")
    book: Epub = Epub(book_path)
    text = book.get_full_text()
    ps: PlotSentiment = PlotSentiment()
    er: EntityExtractor = EntityExtractor("en_core_web_trf", text)
    g: Gemini = Gemini()
    quotes = book.get_full_text_quotes(text)
    associated_quotes = er.associate_text_quotes(quotes)
    nw_dict = er.build_conversational_network(associated_quotes)
    associated_quotes_obj_list = {}
    for character in ("heathcliff", "catherine", "edgar", "isabella linton", "hindley"):
        character_quotes = er.get_character_quotes(
            nw_dict=nw_dict,
            character=str(character),
            n=20,
            sentiment_descending=True,
            sentiment_boundary=0.0,
            length_descending=True,
            min_quote_len=10,
        )
        associated_quotes_obj_list[character] = character_quotes
    character_summaries = {}
    for character, quotes in associated_quotes_obj_list.items():
        character_quotes = [q["quote"] for q in quotes]
        res = g.prompt("gemini-2.5-flash", "\n".join(character_quotes), "character_summary", character, "Wuthering Heights")
        cleaned = res.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        if not cleaned.startswith("{"):
            cleaned = "{" + cleaned + "}"
        character_summaries[character] = json.loads(cleaned)
    print(json.dumps(character_summaries))

# just putting this here so i can remove from main
def get_character_summaries_from_gemini():
    associated_quotes_obj_list = {}
    for character in ("heathcliff", "catherine", "edgar", "isabella linton", "hindley"):
        character_quotes = er.get_character_quotes(
            nw_dict=nw_dict,
            character=str(character),
            n=20,
            sentiment_descending=True,
            sentiment_boundary=0.0,
            length_descending=True,
            min_quote_len=10,
        )
        associated_quotes_obj_list[character] = character_quotes
    character_summaries = {}
    for character, quotes in associated_quotes_obj_list.items():
        character_quotes = [q["quote"] for q in quotes]
        res = g.prompt("gemini-2.5-flash", "\n".join(character_quotes), "character_summary", character, "Wuthering Heights")
        character_summaries[character] = res
