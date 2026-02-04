import matplotlib.pyplot as plt
from labMTsimple.storyLab import (
    emotion,
    emotionFileReader,
    emotionV,
    stopper
)


CTX_WINDOW = 10000

# the value we slide the context window across 
# by. lower value gives more valence values
# but impacts performance, vice versa as you increase
SLIDE = 1000

class PlotSentiment():
    def __init__(self):
        self.lang = "english"
        self.labMT, self.labMTvector, self.labMTwordlist = emotionFileReader(stopval=0.0, lang=self.lang, returnVector=True)

    def get_slice_valence(self, words):
        joined_slice = " ".join(words)
        sliceValence, sliceFvec = emotion(joined_slice, self.labMT, shift=True, happsList=self.labMTvector)
        sliceStoppedVec = stopper(sliceFvec, self.labMTvector, self.labMTwordlist, stopVal=1.0)
        sliceValence = emotionV(sliceStoppedVec, self.labMTvector)
        print(f"slice valence: {sliceValence}")
        return sliceValence 

    def get_section_valence(self, word_list: list[str]) -> list[float]:
        """
        get valence values for a section of a text
        a section can be the whole text
                        
        word_list: the list of words to get valence values for
        """
        valence_vals: list[float] = []
        # sliding window across all words
        for w_idx in range(0, len(word_list) - CTX_WINDOW, SLIDE):
            word_slice = word_list[w_idx:w_idx+CTX_WINDOW]
            valence_vals.append(self.get_slice_valence(word_slice))
        # get last chunk if applicable
        if w_idx + CTX_WINDOW < len(word_list):
            word_slice = word_list[w_idx+CTX_WINDOW:]
            # discard the slice if its <= 1/5
            # of defined context window size.
            if (len(word_slice) <= (CTX_WINDOW / 5)):
                return valence_vals
            valence_vals.append(self.get_slice_valence(word_slice))
        
        return valence_vals
    
    def normalize(self, valence_vals: list[float]) -> list[float]:
        vals_len = len(valence_vals)
        normal_keys = [0] * vals_len
        for i in range(1, vals_len):
            normal_keys[i] = i / (vals_len - 1)
        return normal_keys

    def visualise_sentiment(self, valence_vals: list[float]) -> None:
        x_vals = self.normalize(valence_vals)
        plt.plot(x_vals, valence_vals)
        plt.show()



