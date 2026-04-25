import pytest
from unittest.mock import MagicMock
from app.analysis.plot_sentiment import PlotSentiment

@pytest.fixture
def plotter():
    with MagicMock() as mock_reader:
        p = PlotSentiment()
        return p
    

def test_get_section_valence_windowing(plotter, monkeypatch):
    # fake the value returned by get_slice_valence
    monkeypatch.setattr(plotter, "get_slice_valence", lambda x: 5.0)

    # create list of 800 words
    words = ["word"] * 800
    vals = plotter.get_section_valence(words)

    # should return 3 section valence values given
    # global slide and window variables
    assert len(vals) == 3

def test_calculate_key_plot_points(plotter):
    valence_vals = [5.0, 5.0, 2.0, 5.0]

    points = plotter.calculate_key_plot_points(valence_vals)

    # ensure key plot point have been correctly identified
    assert len(points) == 1
    # ensure normalisation
    assert 0 <= points[0][0] <= 1

def test_get_section_valence_rejects_short_text(plotter):
    words = ["word"] * 100
    with pytest.raises(ValueError):
        plotter.get_section_valence(words)

