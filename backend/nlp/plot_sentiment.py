import matplotlib.pyplot as plt
import math
from labMTsimple.storyLab import emotion, emotionFileReader, emotionV, stopper

CTX_WINDOW = 10000

# the value we slide the context window across
# by. lower value gives more valence values
# but impacts performance, vice versa as you increase
SLIDE = 1000


class PlotSentiment:
    def __init__(self):
        self.lang = "english"
        self.labMT, self.labMTvector, self.labMTwordlist = emotionFileReader(
            stopval=0.0, lang=self.lang, returnVector=True
        )

    def get_slice_valence(self, words):
        joined_slice = " ".join(words)
        sliceValence, sliceFvec = emotion(
            joined_slice, self.labMT, shift=True, happsList=self.labMTvector
        )
        sliceStoppedVec = stopper(
            sliceFvec, self.labMTvector, self.labMTwordlist, stopVal=1.0
        )
        sliceValence = emotionV(sliceStoppedVec, self.labMTvector)
        return sliceValence

    def get_section_valence(self, word_list: list[str]) -> list[float]:
        """
        get valence values for a section of a text.
        a section can be the whole text, a paragraph etc.

        word_list: the list of words to get valence values for
        """
        if len(word_list) < CTX_WINDOW:
            raise ValueError("Given word list is too short.")

        valence_vals: list[float] = []

        end = len(word_list)
        step_end = end - CTX_WINDOW

        # sliding window across all words
        for w_idx in range(0, step_end + 1, SLIDE):
            word_slice = word_list[w_idx : w_idx + CTX_WINDOW]
            valence_vals.append(self.get_slice_valence(word_slice))

        # get last chunk if applicable
        tail_start = w_idx + CTX_WINDOW
        if tail_start < end:
            word_slice = word_list[tail_start:]
            # discard the slice if its <= 1/5
            # of defined context window size.
            if len(word_slice) <= (CTX_WINDOW / 5):
                return valence_vals
            valence_vals.append(self.get_slice_valence(word_slice))

        return valence_vals

    @staticmethod
    def normalize(valence_vals: list[float]) -> list[float]:
        vals_len = len(valence_vals)
        normal_keys = [0] * vals_len
        for i in range(1, vals_len):
            normal_keys[i] = i / (vals_len - 1)
        return normal_keys

    @staticmethod
    def first_difference(valence_vals: list[float]) -> list[(int, float)]:
        """
        finds the points in the emotional arc that
        have the highest absolute difference in valence.
        these points will later be used as markers
        for key plot points when doing plot summarization.

        valence_vals: list of valence/sentiment values
        return: list[(int: index of segment, float: valence of segment)]
        """
        delta: list[float] = []

        for i in range(1, len(valence_vals)):
            d_val = valence_vals[i] - valence_vals[i - 1]
            delta.append((i, d_val))

        # 0.15 is a bit arbitrary, but esentially
        # its for retrieving the top 15% (roughly)
        # delta values by absolute value.
        group = math.ceil(0.15 * len(delta))
        delta_sorted = sorted((delta), key=lambda x: abs(x[1]), reverse=True)
        return delta_sorted[:group]

    @staticmethod
    def get_text_for_summarization(
        text: str, delta: list[(int, float)], valence_vals_len: int
    ) -> list[str]:
        texts = []
        for i, _val in delta:
            base_start = SLIDE * i
            base_end = base_start + CTX_WINDOW
            # get the previous segments content also
            # if the index of the segments allow for it
            if i != 0 and i != valence_vals_len - 1:
                base_start -= SLIDE
                base_end += SLIDE
            texts.append(" ".join(text[base_start:base_end]))
        return texts

    def visualise_sentiment(self, valence_vals: list[float]) -> None:
        x_vals = self.normalize(valence_vals)
        plt.xlabel("Novel Progression (0 - 100%)")
        plt.ylabel("Valence Values")
        plt.plot(x_vals, valence_vals)
        plt.show()
