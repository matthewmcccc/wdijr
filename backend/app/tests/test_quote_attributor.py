
import json
import pytest
from app.analysis.quote_attributor import QuoteAttributor
from unittest.mock import patch, mock_open

@pytest.fixture
def mock_config_string():
    # mock most common speech verbs
    config_data = {"speech_verbs": ["said", "replied", "shouted"]}
    return json.dumps(config_data)

def test_check_span_for_speech(mock_config_string):
    with patch("app.analysis.quote_attributor.open", mock_open(read_data=mock_config_string)):
        qa = QuoteAttributor(
            characters_list=["sherlock"],
            characters_dict={},
            text="Sherlock said hello."
        )

        span_a = "said Sherlock Holmes calmly"
        assert qa.check_span_for_speech(span_a.lower(), "Sherlock", span_len=20) is True

        span_b = "said the very long-winded and exhausted Sherlock"
        assert qa.check_span_for_speech(span_b.lower(), "Sherlock", span_len=3) is False

def test_match_speech_verbs_regex(mock_config_string):
    with patch("app.analysis.quote_attributor.open", mock_open(read_data=mock_config_string)):
        qa = QuoteAttributor(
            characters_list=[],
            characters_dict={},
            text=""
        )
        assert qa.match_speech_verbs_regex("said") is True
        assert qa.match_speech_verbs_regex("replied") is True
        assert qa.match_speech_verbs_regex("walked") is False
        assert qa.match_speech_verbs_regex("unsaid") is False  # word boundary check


def test_check_span_for_speech_no_verb(mock_config_string):
    with patch("app.analysis.quote_attributor.open", mock_open(read_data=mock_config_string)):
        qa = QuoteAttributor(
            characters_list=["alice"],
            characters_dict={},
            text=""
        )
        span = "alice walked into the room"
        assert qa.check_span_for_speech(span.lower(), "alice", span_len=10) is False


def test_get_character_quotes_filters_by_length_and_sentiment():
    nw_dict = {
        "Alice": {
            "Queen": [
                {"quote": "short", "sentiment": 0.9},  # too short
                {"quote": " ".join(["word"] * 15), "sentiment": 0.1},  # sentiment too low
                {"quote": " ".join(["word"] * 15), "sentiment": 0.8},  # should pass
            ]
        }
    }
    results = QuoteAttributor.get_character_quotes(nw_dict, "Alice", n=5)
    assert len(results) == 1
    assert results[0]["sentiment"] == 0.8
