import spacy
import json
import os
import requests
import serpapi
from bs4 import BeautifulSoup
from urllib.parse import urlparse
from dotenv import load_dotenv
from collections import defaultdict
from app.utils.types import PromptInstruction
from app.parsers.epub import Epub, Book, Chapter
from app.services.celery_worker import celery_app
from app.analysis.character_extractor import CharacterExtractor
from app.analysis.network_builder import NetworkBuilder
from app.analysis.plot_sentiment import PlotSentiment
from app.analysis.quote_attributor import QuoteAttributor
from app.analysis.lexical_analysis import LexicalAnalysis
from app.services.task_states import TaskState
from app.analysis.sentiment import (
    build_sentiment_dict_from_network,
    get_top_relationships,
)
from app.llm.gemini import Gemini
from .db_helper import save_analysis_to_db

book_path = os.path.join(os.path.dirname(__file__), "..", "temp", "aaiw.epub")
load_dotenv()


@celery_app.task(bind=True)
def process_epub(self, book_path) -> Epub:
    try:
        if not os.path.exists(book_path):
            raise FileNotFoundError(f"File not found: {book_path}")

        book: Epub = Epub(book_path)
        self.update_state(
            state=TaskState.PROCESSING, meta={"status": "Processing novel..."}
        )

        return book
    except Exception as e:
        print(f"Error processing {book_path}: {str(e)}")
    finally:
        if os.path.exists(book_path):
            try:
                os.remove(book_path)
                print(f"Cleaned up file: {book_path}")
            except Exception as e:
                print(f"Failed to delete {book_path}: {str(e)}")

nlp = spacy.load("en_core_web_trf")

# TODO: split this up a bit
@celery_app.task(bind=True)
def process_text(self, book_path: str):
    self.update_state(state="PROCESSING", meta={"status": "Parsing book..."})

    book, title, author, cover, chapters = parse_book(book_path)
    text = book.get_full_text()

    self.update_state(state="PROCESSING", meta={"status": "Extracting quotes..."})

    g: Gemini = Gemini()
    ps: PlotSentiment = PlotSentiment()
    ce: CharacterExtractor = CharacterExtractor(text, nlp)
    ce.run()
    characters = get_gemini_consolidated_characters(ce, book, g)
    consolidated_characters = [char["canonical_name"] for char in characters]
    character_dict = build_character_dict_from_consolidated(characters)

    nb: NetworkBuilder = NetworkBuilder(consolidated_characters)
    qa: QuoteAttributor = QuoteAttributor(
        consolidated_characters, character_dict, book.get_full_text()
    )
    la: LexicalAnalysis = LexicalAnalysis(consolidated_characters)

    text = book.get_full_text()
    quotes = book.get_full_text_quotes()

    self.update_state(state="PROCESSING", meta={"status": "Identifying characters..."})

    self.update_state(
        state="PROCESSING", meta={"status": "Associating quotes with characters..."}
    )

    associated_quotes = qa.associate_text_quotes(quotes, character_dict)

    self.update_state(state="PROCESSING", meta={"status": "Building social network..."})

    conversational_network = nb.build_conversational_network(associated_quotes)
    cooccurrence_network_data = nb.build_cooccurrence_network(
        book.get_full_text_paras(), character_dict
    )

    ch_dict = {}
    for idx, ch in book.chapters.items():
        ch_dict[idx] = ch.paragraphs
    ch_cooccurence_result = json.dumps(
        nb.build_chapter_cooccurrence(ch_dict, character_dict)
    )

    conversational_nw_nodes = nb.get_nodes_from_network_dict(conversational_network)

    characters_for_db = [
        {"id": i, "name": name} for i, name in enumerate(consolidated_characters)
    ]

    self.update_state(state="PROCESSING", meta={"status": "Analysing plot data..."})

    character_to_character_sentiment_dict = build_sentiment_dict_from_network(
        nw_dict=conversational_network
    )

    chapter_valence_vals = get_chapter_valence_vals(book, ps)
    diff_values = get_diff_values(chapter_valence_vals, ps)
    text_for_summarisation = get_text_for_summarisation(
        book, ps, diff_values, chapter_valence_vals
    )

    self.update_state(
        state="PROCESSING", meta={"status": "Calculating key plot points..."}
    )

    global_inflection_points = get_global_inflection_points(
        chapter_valence_vals, text_for_summarisation
    )

    top_relationships_dict = {}
    top_quotes = {}
    for character in characters_for_db:
        name = character["name"]
        top_relationships_dict[name] = get_top_relationships(
            conversational_network, name
        )
        top_quotes[name] = qa.get_character_quotes(conversational_network, name)

    flat_texts = [
        text for chapter_texts in text_for_summarisation for text in chapter_texts
    ]
    character_summaries = get_character_summaries(
        qa, characters_for_db, conversational_network, g, book.title
    )
    self.update_state(
        state="PROCESSING", meta={"status": "Creating character summaries..."}
    )

    plot_summaries = get_plot_summaries(g, flat_texts, consolidated_characters)
    self.update_state(state="PROCESSING", meta={"status": "Creating plot summaries..."})

    chapter_summaries = get_chapter_summaries(g, chapters, title, book)
    self.update_state(
        state="PROCESSING", meta={"status": "Creating chapter summaries..."}
    )

    chapter_conversational_networks = get_chapter_networks(qa, nb, associated_quotes)
    chapter_nw_nodes = get_chapter_network_nodes(nb, chapter_conversational_networks)
    character_chapter_occurences = get_character_chapter_occurences(
        book, nb, character_dict
    )

    mapping = {name: i for i, name in enumerate(consolidated_characters)}

    self.update_state(state="PROCESSING", meta={"status": "Grabbing author data..."})

    try:
        author_details = get_author_data(book, g, book.author)
    except Exception as e:
        print(f"Grabbing author data failed: {e}")
        author_details = {
            "name": book.author,
            "image_url": "",
            "description": "",
            "other_works": [],
        }


    motifs = get_motif_data(book, g)

    lexical_richness = la.character_lexical_richness(associated_quotes, 100)

    novel_description = get_novel_description(book, g)
    self.update_state(state="PROCESSING", meta={"status": "Finalising analysis..."})

    novel_id = save_analysis_to_db(
        title=title,
        author=author,
        characters=characters_for_db,
        quotes=associated_quotes,
        network=conversational_nw_nodes,
        summaries=character_summaries,
        char_mapping=mapping,
        top_relationships=top_relationships_dict,
        top_quotes=top_quotes,
        sentiment_values=[v for ch in chapter_valence_vals for v in ch],
        inflection_points=global_inflection_points,
        plot_summaries=plot_summaries,
        has_cover=cover is not None,
        character_to_character_sentiment=character_to_character_sentiment_dict,
        chapters=chapters,
        chapter_conversational_networks=chapter_nw_nodes,
        chapter_summaries=chapter_summaries,
        chapter_valence_vals=chapter_valence_vals,
        cooccurrence_frequency_network=cooccurrence_network_data,
        chapter_cooccurrence_network=ch_cooccurence_result,
        author_details=author_details,
        motifs=motifs,
        lexical_richness=lexical_richness,
        novel_description=novel_description,
        character_chapter_occurences=character_chapter_occurences,
    )

    cover_url = book.write_cover(cover, novel_id)

    return {
        "novel_id": novel_id,
        "title": title,
        "network": conversational_nw_nodes,
        "characters": characters,
        "associated_quotes": associated_quotes,
        "top_relationships": top_relationships_dict,
        "sentiment_values": [v for ch in chapter_valence_vals for v in ch],
        "inflection_points": global_inflection_points,
        "plot_summaries": list({}),
        "cover_url": cover_url,
        "character_sentiment": character_to_character_sentiment_dict,
        "chapter_network": {},
        "chapter_lengths": [len(ch) for ch in chapter_valence_vals],
        "author_details": author_details,
        "motifs": motifs,
        "lexical_richness": lexical_richness,
        "chapter_cooccurrence_network": ch_cooccurence_result,
        "character_chapter_occurences": character_chapter_occurences,
    }


def get_gemini_consolidated_characters(ce: CharacterExtractor, book: Epub, g: Gemini):
    g_res = g.generate_consolidated_characters(
        "gemini-3.1-pro-preview",
        ce.consolidated_characters,
        PromptInstruction.CHARACTER_CONSOLIDATION,
        book.author,
        book.title,
    )
    parsed_gemini_consolidated_characters = json.loads(g_res)
    characters = parsed_gemini_consolidated_characters["characters"]
    return characters


def get_character_chapter_occurences(
    book: Epub, nb: NetworkBuilder, character_dict
) -> dict:
    character_ch_occurences = defaultdict(dict)
    for idx, ch in book.chapters.items():
        character_ch_occurences[idx] = nb.build_character_occurence(
            [p.lower() for p in ch.paragraphs], character_dict
        )
    return character_ch_occurences


def get_global_inflection_points(chapter_valence_vals, text_for_summarisation):
    offset = 0
    global_inflection_points = []
    for idx, valence_vals in enumerate(chapter_valence_vals):
        chapter_point_count = len(valence_vals)
        for item in text_for_summarisation[idx]:
            text, chapter_idx, mid_pos, delta = item
            global_x = offset + mid_pos * (chapter_point_count - 1)
            global_inflection_points.append((global_x, delta))
        offset += chapter_point_count
    global_inflection_points.sort(key=lambda p: p[0])
    return global_inflection_points


def get_chapter_valence_vals(book: Epub, ps: PlotSentiment):
    chapter_valence_vals: list = []
    for idx, chapter in book.chapters.items():
        word_list = book.get_chapter_word_list(idx)
        try:
            sentiment_values = ps.get_section_valence(word_list)
            chapter_valence_vals.append(sentiment_values)
        except ValueError:
            chapter_valence_vals.append([])
    return chapter_valence_vals


def get_diff_values(chapter_valence_vals, ps: PlotSentiment):
    diff_values = []
    for idx, valence_vals in enumerate(chapter_valence_vals):
        key_points = ps.calculate_key_plot_points(valence_vals)
        diff_values.append(
            sorted(key_points, key=lambda x: abs(x[1]), reverse=True)[:2]
        )
    return diff_values


def get_text_for_summarisation(
    book: Epub, ps: PlotSentiment, diff_values, chapter_valence_vals
):
    text_for_summarisation = []
    for idx, valence_vals in enumerate(chapter_valence_vals):
        sum_text = ps.get_text_for_summarization(
            book.get_chapter_text(idx),
            diff_values[idx],
            len(chapter_valence_vals[idx]),
            idx,
        )
        text_for_summarisation.append(sum_text)
    return text_for_summarisation


def parse_book(book_path: str) -> tuple[Epub, str, str, list, dict]:
    book: Epub = Epub(book_path)
    title: str = book.title
    author: str = book.author
    cover: list = book.cover
    chapters: dict = book.chapters

    return (book, title, author, cover, chapters)


def get_chapter_networks(qa: QuoteAttributor, nb: NetworkBuilder, associated_quotes):
    chapter_associated_quotes = qa.get_associated_quotes_by_chapter(associated_quotes)
    chapter_conversational_networks = defaultdict(dict)
    for idx, chapter_quotes in chapter_associated_quotes.items():
        chapter_conversational_networks[idx] = nb.build_conversational_network(
            chapter_quotes
        )
    return chapter_conversational_networks


def get_chapter_network_nodes(nb: NetworkBuilder, chapter_networks: dict) -> dict:
    chapter_network_nodes = defaultdict(dict)
    for idx, nw in chapter_networks.items():
        chapter_network_nodes[idx] = nb.get_nodes_from_network_dict(nw)
    return chapter_network_nodes


def get_character_summaries(
    qa: QuoteAttributor, characters: list[dict], nw_dict, g: Gemini, title
):
    associated_quotes_obj_list = {}
    for character in characters:
        char_quotes = qa.get_character_quotes(
            nw_dict=nw_dict,
            character=str(character["name"]),
            n=20,
            sentiment_descending=True,
            sentiment_boundary=0.0,
            length_descending=True,
            min_quote_len=10,
        )
        associated_quotes_obj_list[character["id"]] = char_quotes
    character_summaries = g.character_summary_mass_prompt(
        "gemini-2.5-flash",
        characters,
        associated_quotes_obj_list,
        PromptInstruction.CHARACTER_SUMMARY,
        title,
    )
    return character_summaries


def get_chapter_summaries(g: Gemini, chapters, book_title, book):
    chapter_items = []
    idx_order = []
    for idx, chapter in chapters.items():
        chapter_items.append((book.get_chapter_text(idx), idx, chapter.title))
        idx_order.append(idx)
    responses = g.chapter_summary_mass_prompt(
        "gemini-2.5-flash", chapter_items, PromptInstruction.CHAPTER_SUMMARY, book_title
    )
    return dict(responses)


def get_plot_summaries(
    g: Gemini, summarisation_texts: list[tuple], characters: list[str]
):
    text_only = [text[0] for text in summarisation_texts]
    chapter_indices = [text[1] for text in summarisation_texts]
    plot_summaries = g.text_span_summary_mass_prompt(
        "gemini-2.5-flash", text_only, PromptInstruction.EXCERPT_SUMMARY, characters
    )
    return list(zip(plot_summaries, chapter_indices))


def get_character_thumbnails(
    title: str, consolidated_characters: list[str], novel_id: str
):
    def send_request(character: str, title: str):
        try:
            api_key = os.getenv("SERP_API_KEY")
        except Exception as e:
            print(f"Couldn't grab api key: {e}")
        client = serpapi.Client(api_key=api_key)
        n_title = title.replace("'s", " ")
        results = client.search(
            {
                "engine": "google_images",
                "q": f"{character} {n_title.lower()} illustration",
                "location": "United Kingdom",
                "google_domain": "google.com",
                "hl": "en",
                "gl": "us",
                "device": "desktop",
            }
        )

        data_dir = os.path.join(
            os.path.dirname(__file__),
            "..",
            "data",
            str(novel_id),
            "character_thumbnails",
        )

        try:
            image_results = results["image_results"]
            image = image_results[0]["thumbnail"]
            path = urlparse(image).path
            ext = os.path.splitext(path)[1]
            with open(f"{data_dir}/{character}{ext}", "wb") as handler:
                handler.write(requests.get(image).content)
        except Exception as e:
            print(f"Couldn't grab image from results: {e}")

    for character in consolidated_characters:
        send_request(character, title)


def get_author_data(book: Epub, g: Gemini, author: str) -> dict:
    author_dict = {
        "name": author,
        "image_url": "",
        "description": "",
        "other_works": [],
    }

    author_normalized = ("_").join(author.split(" "))
    wiki_url = f"https://en.wikipedia.org/w/api.php?action=query&titles={author_normalized}&prop=extracts|pageimages&explaintext=true&pithumbsize=400&format=json"
    try:
        wiki_res = requests.get(
            wiki_url,
            headers={
                "User-Agent": "wdijr/1.0 (dissertation project; mattmcconnachie4@gmail.com)"
            },
        )

        wiki_body = wiki_res.json()
        extract = next(iter(wiki_body["query"]["pages"].values()))

        author_summary = g.generate_author_summary(
            "gemini-2.5-flash", PromptInstruction.AUTHOR_SUMMARY, extract, book.title
        )

        other_works_list = []

        open_lib_url = f"https://openlibrary.org/search.json?author={("+").join(author.split(" "))}&limit=10"
        open_lib_res = requests.get(
            open_lib_url,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36"
            },
        )
        if open_lib_res.ok and open_lib_res.text:
            open_lib_body = open_lib_res.json()
            for doc in open_lib_body["docs"]:
                if book.title not in doc["title"] and author in doc["author_name"]:
                    image_url = (
                        f"https://covers.openlibrary.org/b/id/{doc['cover_i']}-M.jpg"
                        if "cover_i" in doc
                        else ""
                    )
                    title = doc["title"] if "title" in doc else ""
                    year = (
                        doc["first_publish_year"] if "first_publish_year" in doc else ""
                    )
                    work_obj = {"title": title, "image_url": image_url, "year": year}
                    other_works_list.append(work_obj)
            author_dict["name"] = author
            try:
                author_dict["image_url"] = extract["thumbnail"]["source"]
            except KeyError:
                author_dict["image_url"] = ""
            author_dict["description"] = json.loads(author_summary)["summary"]
            author_dict["other_works"] = other_works_list
    except (requests.RequestException, KeyError, ValueError) as e:
        print("Wikipedia/summary step failed: {e}")

    else:
        print(f"Open library request failed: {open_lib_res.status_code}")

    return author_dict


def get_chapter_valence_vals(book: Epub, ps: PlotSentiment) -> list:
    chapter_valence_vals: list = []
    for idx, chapter in book.chapters.items():
        word_list = book.get_chapter_word_list(idx)
        try:
            sentiment_values = ps.get_section_valence(word_list)
            chapter_valence_vals.append(sentiment_values)
        except ValueError:
            chapter_valence_vals.append([])
    diff_values = []
    for idx, valence_vals in enumerate(chapter_valence_vals):
        key_points = ps.calculate_key_plot_points(valence_vals)
        diff_values.append(
            sorted(key_points, key=lambda x: abs(x[1]), reverse=True)[:2]
        )
    return chapter_valence_vals


def get_novel_description(book: Epub, g: Gemini):
    response = g.generate_novel_description(
        "gemini-2.5-flash",
        PromptInstruction.NOVEL_DESCRIPTION,
        book.author,
        book.title,
    )

    return response


def get_motif_data(book: Epub, g: Gemini):
    chunks = book.chunk_text_for_motif_analysis()
    motifs = g.generate_motif_extraction(
        "gemini-2.5-flash",
        chunks,
        PromptInstruction.MOTIF_EXTRACTION,
        novel_title=book.title,
    )

    all_motifs = []
    for m in motifs:
        parsed = json.loads(m)
        all_motifs.extend(parsed["motifs"])

    consolidated_motifs = g.generate_motif_consolidation(
        "gemini-2.5-flash",
        all_motifs,
        PromptInstruction.MOTIF_CONSOLIDATION,
        book.title,
    )

    return json.loads(consolidated_motifs)


def build_character_dict_from_consolidated(consolidated):
    persons_dict = {}
    for character in consolidated:
        for alias in character["aliases"]:
            persons_dict[alias] = character["canonical_name"]
    return persons_dict
