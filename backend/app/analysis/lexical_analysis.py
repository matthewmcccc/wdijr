from collections import defaultdict

class LexicalAnalysis():
    def __init__(self, characters):
        self.characters = characters

    def character_lexical_richness(self, associated_quotes, window: int = 100):
        """
        """
        associated_quotes_dict = defaultdict(list)
        for quote_obj in associated_quotes:
            quote = quote_obj["quote"]
            speaker = quote_obj["speaker"]
            if speaker in self.characters:
                associated_quotes_dict[speaker].append(quote)
        mattr_obj = defaultdict(float)
        for speaker, quotes_list in associated_quotes_dict.items():
            quote_str = (" ").join(quotes_list)
            tokens = [w.strip(".,!?;:\"'()") for w in quote_str.lower().split() if w.strip(".,!?;:\"'()")]
            if len(tokens) < window:
                ttr  = round(len(set(tokens)) / len(tokens), 3)
                if ttr != 1.0:
                    mattr_obj[speaker] = {"mattr": round(len(set(tokens)) / len(tokens), 3), "word_count": len(tokens)}
            else: 
                ttrs = []
                for i in range(len(tokens) - window + 1):
                    w = tokens[i : i + window]
                    ttrs.append(len(set(w)) / window)
                ttr = round(sum(ttrs) / len(ttrs), 3)
                if ttr != 1.0:
                    mattr_obj[speaker] = {"mattr": round(sum(ttrs) / len(ttrs), 3), "word_count": len(tokens)}
        return mattr_obj