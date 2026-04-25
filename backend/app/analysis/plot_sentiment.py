import matplotlib.pyplot as plt
import math
from labMTsimple.storyLab import emotion, emotionFileReader, emotionV, stopper

SUMMARIZATION_CTX_WINDOW = 2000
DELTA_THRESHOLD = 0.15
CTX_WINDOW = 500
# the value we slide the context window across by.
# lower value gives more valence values
# but impacts performance, vice versa as you increase
SLIDE = 150


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
        Get valence values for a section of a text.
        a section can be the whole text, a paragraph etc.

        word_list: the list of words to get valence values for
        """
        if len(word_list) < CTX_WINDOW:
            raise ValueError(
                f"Given word list is too short. Length: {len(word_list)}\nRequired length: {CTX_WINDOW}"
            )

        valence_vals: list[float] = []

        end = len(word_list)
        step_end = end - CTX_WINDOW

        for w_idx in range(0, step_end + 1, SLIDE):
            word_slice = word_list[w_idx : w_idx + CTX_WINDOW]
            valence_vals.append(self.get_slice_valence(word_slice))

        tail_start = w_idx + CTX_WINDOW
        if tail_start < end:
            word_slice = word_list[tail_start:]
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
    def calculate_key_plot_points(valence_vals: list[float]) -> list[(float, float)]:
        delta: list[(float, float)] = []
        points = []

        for i in range(1, len(valence_vals)):
            d_val = valence_vals[i - 1] - valence_vals[i]
            delta.append((i / (len(valence_vals) - 1), d_val))

        for i, d in enumerate(delta):
            prev = delta[max(0, i - 1)][1]
            if (prev > 0 and d[1] < 0) or (prev < 0 and d[1] > 0):
                diff = abs(prev - d[1])
                if diff > DELTA_THRESHOLD:
                    points.append(delta[i - 1])

        return points

    @staticmethod
    def get_text_for_summarization(
        ch_text: str, deltas: list[(int, float)], valence_vals_len: int, idx
    ) -> list[str]:
        words = ch_text.split()
        half = SUMMARIZATION_CTX_WINDOW // 2

        spans = []
        for pos, val in deltas:
            i = int(round(pos * (valence_vals_len - 1)))
            start = max(0, (SLIDE * i) - half)
            end = min(len(words), (SLIDE * i) + half)
            spans.append((start, end, val))

        spans.sort()
        merged = []
        for start, end, val in spans:
            if merged and start < merged[-1][1]:
                prev_start, prev_end, prev_val = merged[-1]
                keep_val = prev_val if abs(prev_val) >= abs(val) else val
                merged[-1] = (prev_start, max(prev_end, end), keep_val)
            else:
                merged.append((start, end, val))

        texts = []
        for start, end, val in merged:
            mid_word = (start + end) / 2
            mid_pos = mid_word / len(words) if len(words) > 0 else 0
            texts.append((" ".join(words[start:end]), idx, mid_pos, val))
        return texts

    @staticmethod
    def visualise_sentiment(self, valence_vals: list[float]) -> None:
        x_vals = self.normalize(valence_vals)
        plt.xlabel("Novel Progression (0 - 100%)")
        plt.ylabel("Valence Values")
        plt.plot(x_vals, valence_vals)
        plt.show()
