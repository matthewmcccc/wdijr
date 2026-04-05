import networkx as nx
from networkx.algorithms import community
from collections import Counter, defaultdict
from itertools import combinations

ALLOWED_CHARACTER_DIFF = 1500

class NetworkBuilder():
    def __init__(self, characters):
        self.characters = characters

    def build_character_occurence(self, paras: list[str], character_dict: dict) -> dict:
        occurences = Counter()
        for para in paras:
            para_lower = para.lower()
            for variant, canonical in character_dict.items():
                if variant in para_lower:
                    occurences[canonical] += 1
        return occurences
    
    def build_cooccurrence_network(self, paras: list[str], character_dict: dict) -> dict:
        cooccurrence_dict = defaultdict(list)
        for para in paras:
            para_lower = para.lower()
            seen = set()
            for variant, canonical in character_dict.items():
                if variant in para_lower:
                    seen.add(canonical)
            for char_a, char_b in combinations(seen, 2):
                key = tuple(sorted([char_a, char_b]))
                cooccurrence_dict[key].append(1)

        cooccurrence_frequency_dict = defaultdict(int)
        for pair, frequency_list in cooccurrence_dict.items():
            cooccurrence_frequency_dict[pair] = sum(frequency_list)

        graph = nx.Graph()
        for (char_a, char_b), weight in cooccurrence_frequency_dict.items():
            graph.add_edge(char_a, char_b, weight=weight)

        communities = nx.community.greedy_modularity_communities(graph, weight="weight")
        group_map = {}
        for group_idx, community in enumerate(communities):
            for character in community:
                group_map[character] = group_idx

        all_characters = set()
        for (a, b) in cooccurrence_frequency_dict:
            all_characters.add(a)
            all_characters.add(b)

        nodes = [{"id": char, "group": group_map.get(char, 0)} for char in all_characters]
        links = [{"source": a, "target": b, "value": v} for (a, b), v in cooccurrence_frequency_dict.items()]

        return {"nodes": nodes, "links": links}
    
    # TODO: write a TypedDict class for this return type...
    def build_conversational_network(
        self, quotes: list[dict]
    ) -> dict[str, dict[str, list[dict]]]:
        """
        Build a conversational network from a list of associated quotes.
        """
        quotes_len = len(quotes)
        nw_dict = defaultdict(lambda: defaultdict(list))
        for q_idx in range(1, quotes_len):
            prev_speaker = quotes[q_idx - 1]["speaker"]
            curr_speaker = quotes[q_idx]["speaker"]
            if prev_speaker is None or curr_speaker is None:
                continue
            prev_end = quotes[q_idx - 1]["span"][1]
            curr_start = quotes[q_idx]["span"][0]
            sentiment = quotes[q_idx]["sentiment"]
            space = curr_start - prev_end
            if (prev_speaker != curr_speaker) and (space < ALLOWED_CHARACTER_DIFF):
                nw_dict[curr_speaker][prev_speaker].append(
                    {"quote": quotes[q_idx]["quote"], "sentiment": sentiment}
                )
        return nw_dict
    
    def build_chapter_cooccurrence(self, chapters_paras: dict[int, list[str]], character_dict: dict) -> dict:
        result = {}
        for idx, paras in chapters_paras.items():
            counts = defaultdict(int)
            for para in paras:
                para_lower = para.lower()
                seen = set()
                for variant, canonical in character_dict.items():
                    if variant in para_lower:
                        seen.add(canonical)
                for char_a, char_b in combinations(seen, 2):
                    key = tuple(sorted([char_a, char_b]))
                    counts[key] += 1
            result[idx] = {f"{a}--{b}": count for (a, b), count in counts.items()}
        return result
    
    @staticmethod
    def get_nodes_from_network_dict(
        nw_dict: dict[str, dict[str, list[dict]]],
    ) -> list[dict]:
        nodes = []
        links = []
        seen_nodes = set()

        for character, network in nw_dict.items():
            if character not in seen_nodes:
                nodes.append({"id": str(character), "group": 1})
                seen_nodes.add(character)

            for name, quotes in network.items():
                if name not in seen_nodes:
                    nodes.append({"id": str(name), "group": 1})
                    seen_nodes.add(name)

                links.append(
                    {
                        "source": str(character),
                        "target": str(name),
                        "value": sum(q["sentiment"] for q in quotes),
                    }
                )
        G = nx.Graph()
        G.add_nodes_from([n["id"] for n in nodes])
        G.add_edges_from([(l["source"], l["target"]) for l in links])

        communities = community.louvain_communities(G)
        node_to_group = {}
        for group_id, members in enumerate(communities):
            for member in members:
                node_to_group[member] = group_id

        for node in nodes:
            node["group"] = node_to_group.get(node["id"], 0)

        return {"nodes": nodes, "links": links}