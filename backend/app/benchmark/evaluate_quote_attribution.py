import json
import spacy
from app.parsers.epub import Epub
from app.utils.types import PromptInstruction
from app.benchmark.load import load
from app.analysis.character_extractor import CharacterExtractor
from app.analysis.quote_attributor import QuoteAttributor
from app.analysis.network_builder import NetworkBuilder
from app.llm.gemini import Gemini
from app.services.book_processor import build_character_dict_from_consolidated

nlp = spacy.load("en_core_web_trf")
aaiw: Epub = Epub("./app/temp/aaiw.epub")
emma: Epub = Epub("./app/temp/emma.epub")
wh: Epub = Epub("./app/temp/wh.epub")
books = [aaiw, emma, wh]

def normalise(name):
    if not name:
        return ''
    name = name.strip().lower()
    name = name.replace('.', '')
    for prefix in ('the mad ', 'the ', 'mr ', 'mrs ', 'miss ', 'sir '):
        name = name.removeprefix(prefix)
    return name


def names_match(gold, pred):
    if not gold or not pred:
        return False
    g = normalise(gold)
    p = normalise(pred)
    if g == p:
        return True
    return bool(set(g.split()) & set(p.split()))


def score_pairs(pairs):
    tp = fp = fn = 0
    for pred, gold in pairs:
        gold_speaker = normalise(gold.get('gold_speaker', ''))
        pred_speaker = normalise(pred.get('speaker', ''))

        if gold_speaker in ('none', ''):
            continue

        if pred_speaker == '':
            fn += 1
        elif names_match(pred_speaker, gold_speaker):
            tp += 1
        else:
            fp += 1

    precision = tp / (tp + fp) if (tp + fp) > 0 else 0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0
    return (precision, recall, f1, tp, fp, fn)


def get_quote_attribution_accuracy(associated_quotes, top_chapters_quotes, book):
    all_pairs = []

    filtered = [q for q in associated_quotes if q.get('chapter_number') in top_chapters_quotes.keys()]

    for chapter_num in top_chapters_quotes.keys():

        chapter_preds = [q for q in filtered if q['chapter_number'] == chapter_num]
        chapter_golds = load(
            f"{book.title.lower().replace(' ', '_').replace(chr(39), '')}_chapter_{chapter_num}_quotes.csv"
        )
        for pred, gold in zip(chapter_preds, chapter_golds):
            all_pairs.append((pred, gold))

    agg = score_pairs(all_pairs)
    print(f"Aggregate ({len(all_pairs)} quotes): P={agg[0]:.2f} R={agg[1]:.2f} F1={agg[2]:.2f} (TP={agg[3]} FP={agg[4]} FN={agg[5]})")

    for rule in ["post_span", "prior_span", "pronoun", None]:
        subset = [(p, g) for p, g in all_pairs if p.get('attribution_rule') == rule] 
        if not subset:
            continue
        s = score_pairs(subset)
        # print(f"  {rule} ({len(subset)} quotes): P={s[0]:.2f} R={s[1]:.2f} F1={s[2]:.2f} (TP={s[3]} FP={s[4]} FN={s[5]})")

    return (agg[0], agg[1], agg[2])


def quotes_benchmark():
    for book in books:
        print("******************************")

        top_chapters_quotes = book.get_top_dialogue_chapters(n=3)

        ce: CharacterExtractor = CharacterExtractor(
            text=book.get_full_text(),
            nlp=nlp,
        )
        ce.run()

        qa = QuoteAttributor(
            characters_list=ce.consolidated_characters,
            characters_dict=ce.build_character_dict(),
            text=book.get_full_text(),
        )


        # # g: Gemini = Gemini()
        # # g_res = g.generate_consolidated_characters(
        # #     "gemini-3.1-pro-preview",
        # #     ce.consolidated_characters,
        # #     PromptInstruction.CHARACTER_CONSOLIDATION,
        # #     book.author,
        # #     book.title
        # # )


        # # parsed_gemini_consolidated_characters = json.loads(g_res)
        # # characters = parsed_gemini_consolidated_characters["characters"]
        # # consolidated_characters = [char["canonical_name"] for char in characters]
        # # character_dict = build_character_dict_from_consolidated(characters)
        # # canonical_to_gender = {char["canonical_name"]: char["gender"] for char in characters}

        # # qa_gemini = QuoteAttributor(
        # #     characters_list=consolidated_characters,
        # #     characters_dict=character_dict,
        # #     text=book.get_full_text(),
        # #     canonical_to_gender=canonical_to_gender
        # # )

        associated_quotes = qa.associate_text_quotes(book.get_full_text_quotes())

        get_quote_attribution_accuracy(
            associated_quotes,
            top_chapters_quotes,
            book
        )


quotes_benchmark()