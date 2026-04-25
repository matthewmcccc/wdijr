import pytest
from unittest.mock import MagicMock
from app.analysis.character_extractor import CharacterExtractor
from collections import namedtuple

Entity = namedtuple('Entity', ['text', 'label_'])

@pytest.fixture
def mock_extractor(monkeypatch):
    mock_nlp = MagicMock()
    monkeypatch.setattr("spacy.load", lambda *args, **kwargs: mock_nlp)
    
    extractor = CharacterExtractor("test text", nlp=mock_nlp)
    return extractor

def test_get_characters_from_text_filtering(mock_extractor):
    mock_doc = MagicMock()
    mock_doc.ents = [
        *[Entity(text="Matthew", label_="PERSON") for _ in range(5)],
        *[Entity(text="He", label_="PERSON") for _ in range(2)],
        *[Entity(text="London", label_="GPE") for _ in range(10)],
        *[Entity(text="University of DUndee", label_="ORG") for _ in range(5)],
        *[Entity(text="University of DUndee", label_="PERSON") for _ in range(6)],
        *[Entity(text="Jo", label_="PERSON") for _ in range(5)],
    ]

    mock_extractor.doc = mock_doc
    mock_extractor.nlp.Defaults.stop_words = {"he", "she", "it", "the"}

    characters = mock_extractor.get_characters_from_text()

    assert "matthew" in characters
    assert "he" not in characters 
    assert "london" not in characters 
    assert "university of dundee" in characters 
    assert "jo" not in characters 
    assert len(characters) == 2

def test_consolidate_characters(mock_extractor):
    mock_characters = [
        "matthew smith",
        "george michael",
        "sarah silverman",
        "silly goose",
        "simon smith",
    ]

    mock_extractor.characters = mock_characters
    
    consolidated_characters = mock_extractor.consolidate_characters()

    first_group = consolidated_characters[0]
    last_group = consolidated_characters[-1]

    # simon smith gets consolidated into the "matthew smith" variant group
    assert "smith" in first_group
    assert "matthew" in first_group
    assert "matthew smith" in first_group
    assert "simon smith" not in last_group
    assert "simon smith" in first_group

    for group in consolidated_characters:
        assert "simon" not in group

    assert len(consolidated_characters) == 4