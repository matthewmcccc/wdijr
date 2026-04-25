import pytest
from app.analysis.network_builder import NetworkBuilder


@pytest.fixture
def builder():
    return NetworkBuilder(characters=["Alice", "Queen", "Hatter"])


@pytest.fixture
def character_dict():
    return {
        "alice": "Alice",
        "queen": "Queen",
        "hatter": "Hatter",
        "mad hatter": "Hatter",
    }


def test_build_character_occurence_counts_variants(builder, character_dict):
    paras = [
        "Alice went to the party.",
        "The Mad Hatter and Alice were there.",
        "The Queen arrived late.",
    ]
    counts = builder.build_character_occurence(paras, character_dict)
    assert counts["Alice"] == 2
    assert counts["Hatter"] == 2
    assert counts["Queen"] == 1


def test_build_character_occurence_merges_variants(builder, character_dict):
    paras = [
        "The hatter sat down.",
        "The mad hatter poured tea.",
    ]
    counts = builder.build_character_occurence(paras, character_dict)
    assert counts["Hatter"] == 3


def test_build_conversational_network_skips_none_speakers(builder):
    quotes = [
        {"speaker": "Alice", "span": (0, 50), "quote": "Hello", "sentiment": 0.5},
        {"speaker": None, "span": (60, 100), "quote": "...", "sentiment": 0.0},
        {"speaker": "Queen", "span": (110, 160), "quote": "Off with her head", "sentiment": -0.8},
    ]
    nw = builder.build_conversational_network(quotes)
    assert len(nw) == 0


def test_build_conversational_network_links_adjacent_speakers(builder):
    quotes = [
        {"speaker": "Alice", "span": (0, 50), "quote": "Hello", "sentiment": 0.5},
        {"speaker": "Queen", "span": (60, 110), "quote": "Who are you?", "sentiment": -0.3},
        {"speaker": "Alice", "span": (120, 180), "quote": "I'm Alice", "sentiment": 0.2},
    ]
    nw = builder.build_conversational_network(quotes)
    assert "Queen" in nw
    assert "Alice" in nw["Queen"]
    assert "Alice" in nw
    assert "Queen" in nw["Alice"]


def test_build_conversational_network_respects_distance_threshold(builder):
    quotes = [
        {"speaker": "Alice", "span": (0, 50), "quote": "Hello", "sentiment": 0.5},
        {"speaker": "Queen", "span": (2000, 2050), "quote": "Goodbye", "sentiment": -0.1},
    ]
    nw = builder.build_conversational_network(quotes)
    assert len(nw) == 0


def test_build_cooccurrence_network_creates_edges(builder, character_dict):
    paras = [
        "Alice and the Queen had tea.",
        "The Hatter joined Alice.",
    ]
    result = builder.build_cooccurrence_network(paras, character_dict)
    sources = {link["source"] for link in result["links"]}
    targets = {link["target"] for link in result["links"]}
    all_connected = sources | targets
    assert "Alice" in all_connected
    assert "Queen" in all_connected
    assert "Hatter" in all_connected