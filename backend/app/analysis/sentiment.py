from collections import defaultdict


def get_top_relationships(
    nw_dict: dict[str, dict[str, list[dict]]], character, n=3
) -> list[str]:
    """
    Get a list of the top relationships from character to character.

    :param nw_dict: The network dictionary built from associated text quotes
    :type nw_dict: dict
    :param character: The character for which you want to retrieve the top relationships for.
    :type character: str
    :param n: The top n character relationships you want to retrieve
    :type n: int
    """
    counts = {}

    for target, quotes in nw_dict[character].items():
        counts[target] = {
            "count": len(quotes),
            "total_sentiment": sum(q["sentiment"] for q in quotes),
        }

    for speaker, network in nw_dict.items():
        if character in network and speaker != character:
            incoming_quotes = network[character]
            if speaker in counts:
                counts[speaker]["count"] += len(incoming_quotes)
                counts[speaker]["total_sentiment"] += sum(
                    q["sentiment"] for q in incoming_quotes
                )
            else:
                counts[speaker] = {
                    "count": len(incoming_quotes),
                    "total_sentiment": sum(q["sentiment"] for q in incoming_quotes),
                }

    result = []
    for name, data in counts.items():
        result.append((name, data["count"], data["total_sentiment"] / data["count"]))

    result.sort(key=lambda x: x[1], reverse=True)
    return result[:n]


def build_sentiment_dict_from_network(nw_dict: dict) -> dict:
    character_sentiment_dict = defaultdict(dict)
    for speaker, quote_dict in nw_dict.items():
        for target, quote_list in quote_dict.items():
            character_sentiment_dict[speaker][target] = [
                q["sentiment"] for q in quote_list
            ]
    return character_sentiment_dict
