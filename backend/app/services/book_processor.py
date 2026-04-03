
import json
import os
import requests
import serpapi
from bs4 import BeautifulSoup
from urllib.parse import urlparse
from dotenv import load_dotenv
from collections import defaultdict
from app.parsers.epub import Epub
from app.services.celery_worker import celery_app
from app.nlp.ner import EntityExtractor
from app.nlp.plot_sentiment import PlotSentiment
from app.services.task_states import TaskState
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


# TODO: split this up a bit
@celery_app.task(bind=True)
def process_text(self, book_path):
    ps: PlotSentiment = PlotSentiment()

    self.update_state(state="PROCESSING", meta={"status": "Parsing book..."})

    book = Epub(book_path)
    title = book.title
    author = book.author
    cover = book.cover
    chapters = book.chapters

    self.update_state(state="PROCESSING", meta={"status": "Extracting quotes..."})

    text = book.get_full_text()
    quotes = book.get_full_text_quotes(text)

    self.update_state(state="PROCESSING", meta={"status": "Identifying characters..."})

    er: EntityExtractor = EntityExtractor("en_core_web_trf", text)
    g: Gemini = Gemini()

    self.update_state(
        state="PROCESSING", meta={"status": "Associating quotes with characters..."}
    )

    associated_quotes = er.associate_text_quotes(quotes)

    self.update_state(state="PROCESSING", meta={"status": "Building social network..."})

    conversational_network = er.build_conversational_network(associated_quotes)
    cooccurrence_network_data = er.build_cooccurrence_network(book.get_full_text_paras())

    ch_dict = {}
    for idx, ch in book.chapters.items():
        soup = BeautifulSoup(ch.item.get_body_content(), "html.parser")
        ch_dict[idx] = [para.get_text() for para in soup.find_all("p")]
    ch_cooccurence_result = json.dumps(er.build_chapter_cooccurrence(ch_dict))
    
    conversational_nw_nodes = er.get_nodes_from_network_dict(conversational_network)

    characters = er.canonical_characters
    characters = [{"id": i, "name": name} for i, name in enumerate(characters)]

    self.update_state(state="PROCESSING", meta={"status": "Analysing plot data..."})

    character_to_character_sentiment_dict = er.build_sentiment_dict_from_network(
        nw_dict=conversational_network
    )

    chapter_valence_vals: list = []
    for idx, chapter in book.chapters.items():
        word_list = book.get_chapter_word_list(idx)
        try:
            sentiment_values = ps.get_section_valence(
                word_list
            )
            chapter_valence_vals.append(sentiment_values)
        except ValueError:
            chapter_valence_vals.append([])
    diff_values = []
    for idx, valence_vals in enumerate(chapter_valence_vals):
        first_diff = ps.first_difference(
            valence_vals
        )
        diff_values.append(sorted(first_diff, key=lambda x: abs(x[1]), reverse=True)[:2])

    text_for_summarisation = []
    for idx, valence_vals in enumerate(chapter_valence_vals):
        sum_text = ps.get_text_for_summarization(
            book.get_chapter_text(idx),
            diff_values[idx],
            len(chapter_valence_vals[idx]),
            idx
        )   
        text_for_summarisation.append(sum_text)

    top_relationships_dict = {}
    top_quotes = {}
    for character in characters: 
        name = character["name"]
        top_relationships_dict[name] = er.get_top_relationships(conversational_network, name)
        top_quotes[name] = er.get_character_quotes(conversational_network, name)

    flat_texts = [text for chapter_texts in text_for_summarisation for text in chapter_texts]
    character_summaries = get_character_summaries(er, characters, conversational_network, g, book.title)
    self.update_state(
        state="PROCESSING", meta={"status": "Creating character summaries..."}
    )

    plot_summaries = get_plot_summaries(g, flat_texts, er.canonical_characters)
    self.update_state(
        state="PROCESSING", meta={"status": "Creating plot summaries..."}
    )

    chapter_summaries = get_chapter_summaries(g, chapters, title, book)
    self.update_state(
        state="PROCESSING", meta={"status": "Creating chapter summaries..."}
    )

    chapter_conversational_networks = get_chapter_networks(er, associated_quotes)
    chapter_nw_nodes = get_chapter_network_nodes(er, chapter_conversational_networks)

    mapping = er.persons_to_id()

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

    self.update_state(
        state="PROCESSING", meta={"status": "Calculating key plot points..."}
    )

    author_details = get_author_data(
        book,
        g,
        book.author
    )

    self.update_state(
        state="PROCESSING", meta={"status": "Grabbing author data..."}
    )

    motifs = get_motif_data(
        book,
        g
    )

    lexical_richness = er.character_lexical_richness(
        quotes,
        100
    )

    novel_description = get_novel_description(
        book, g
    )

    self.update_state(
        state="PROCESSING", meta={"status": "Finalising analysis..."}
    )

    novel_id = save_analysis_to_db(
        title=title,
        author=author,
        characters=characters,
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
    }


def get_chapter_networks(er: EntityExtractor, associated_quotes):
    chapter_associated_quotes = er.get_associated_quotes_by_chapter(associated_quotes)
    chapter_conversational_networks = defaultdict(dict)
    for idx, chapter_quotes in chapter_associated_quotes.items():
        chapter_conversational_networks[idx] = er.build_conversational_network(
            chapter_quotes
        )
    return chapter_conversational_networks


def get_chapter_network_nodes(er: EntityExtractor, chapter_networks: dict) -> dict:
    chapter_network_nodes = defaultdict(dict)
    for idx, nw in chapter_networks.items():
        chapter_network_nodes[idx] = er.get_nodes_from_network_dict(nw)
    return chapter_network_nodes

def get_character_summaries(
    er: EntityExtractor, characters: list[dict], nw_dict, g: Gemini, title
):
    associated_quotes_obj_list = {}
    for character in characters:
        char_quotes = er.get_character_quotes(
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
        "character_summary",
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
        "gemini-2.5-flash", chapter_items, "chapter_summary", book_title
    )
    return dict(responses)


def get_plot_summaries(g: Gemini, summarisation_texts: list[tuple], characters: list[str]):
    text_only = [text[0] for text in summarisation_texts]
    chapter_indices = [text[1] for text in summarisation_texts]
    plot_summaries = g.text_span_summary_mass_prompt(
        "gemini-2.5-flash", text_only, "excerpt_summary", characters
    )
    return zip(plot_summaries, chapter_indices)

def get_character_thumbnails(title: str, er: EntityExtractor, novel_id: str):
    def send_request(character: str, title: str):
        try:
            api_key = os.getenv("SERP_API_KEY")
        except Exception as e:
            print(f"Couldn't grab api key: {e}")
        client = serpapi.Client(
            api_key=api_key
        )
        n_title = title.replace("'s", " ")
        results = client.search({
            "engine": "google_images",
            "q": f"{character} {n_title.lower()} illustration",
            "location": "United Kingdom",
            "google_domain": "google.com",
            "hl": "en",
            "gl": "us",
            "device": "desktop"
        })

        data_dir = os.path.join(os.path.dirname(__file__), "..", "data", {novel_id}, "character_thumbnails")

        try:
            image_results = results["image_results"]
            image = image_results[0]["thumbnail"]
            path = urlparse(image).path
            ext = os.path.splitext(path)[1]
            with open(f"{data_dir}/{character}{ext}", 'wb') as handler:
                handler.write(requests.get(image).content)
        except Exception as e:
            print(f"Couldn't grab image from results: {e}")

    for character in er.canonical_characters:
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
    wiki_res = requests.get(
        wiki_url,
        headers={
            "User-Agent": "wdijr/1.0 (dissertation project; mattmcconnachie4@gmail.com)"
    })

    wiki_body = wiki_res.json()
    extract = next(iter(wiki_body["query"]["pages"].values()))

    author_summary = g.generate_author_summary(
        "gemini-2.5-flash",
        "author_summary",
        extract,
        book.title
    )

    other_works_list = []

    open_lib_url = f"https://openlibrary.org/search.json?author={("+").join(author.split(" "))}&limit=10"
    open_lib_res = requests.get(
        open_lib_url,
        headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36"
        }
    )
    if open_lib_res.ok and open_lib_res.text:
        open_lib_body = open_lib_res.json()
        for doc in open_lib_body["docs"]:
            if book.title not in doc["title"] and author in doc["author_name"]:
                image_url = f"https://covers.openlibrary.org/b/id/{doc['cover_i']}-M.jpg" if "cover_i" in doc else ""
                title = doc["title"] if "title" in doc else ""
                year = doc["first_publish_year"] if "first_publish_year" in doc else ""
                work_obj = {
                    "title": title,
                    "image_url": image_url,
                    "year": year
                }
                other_works_list.append(work_obj)
        author_dict["name"] = author
        try:
            author_dict["image_url"] = extract["thumbnail"]["source"]
        except:
            author_dict["image_url"] = ""
        author_dict["description"] = json.loads(author_summary)["summary"]
        author_dict["other_works"] = other_works_list

    else:
        print(f"Open library request failed: {open_lib_res.status_code}")
    
    return author_dict


def get_chapter_valence_vals(book: Epub, ps: PlotSentiment) -> list:
    chapter_valence_vals: list = []
    for idx, chapter in book.chapters.items():
        word_list = book.get_chapter_word_list(idx)
        try: 
            sentiment_values = ps.get_section_valence(
                word_list
            )
            chapter_valence_vals.append(sentiment_values)
        except ValueError:
            chapter_valence_vals.append([])
    diff_values = []
    for idx, valence_vals in enumerate(chapter_valence_vals):
        first_diff = ps.first_difference(
            valence_vals
        )
        diff_values.append(sorted(first_diff, key=lambda x: abs(x[1]), reverse=True)[:2])
    return chapter_valence_vals

def get_novel_description(book: Epub, g: Gemini):
    response = g.generate_novel_description(
        "gemini-2.5-flash",
        "novel_description",
        book.author,
        book.title,
    )

    return response


def get_motif_data(book: Epub, g: Gemini):
    chunks = book.chunk_text_for_motif_analysis()   
    motifs = g.generate_motif_extraction(
        "gemini-2.5-flash",
        chunks,
        "motif_extraction",
        novel_title=book.title
    )

    all_motifs = []
    for m in motifs:
        parsed = json.loads(m)
        all_motifs.extend(parsed["motifs"])

    consolidated_motifs = g.generate_motif_consolidation(
        "gemini-2.5-flash",
        all_motifs,
        "motif_consolidation",
        book.title
    )

    return json.loads(consolidated_motifs)
