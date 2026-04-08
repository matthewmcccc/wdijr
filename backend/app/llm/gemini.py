import os
import time
import json
from google import genai
from google.genai import types
from dotenv import load_dotenv
from concurrent.futures import ThreadPoolExecutor
from enum import Enum

load_dotenv()


class PromptInstruction(str, Enum):
    EXCERPT_SUMMARY = "excerpt_summary"
    CHARACTER_SUMMARY = "character_summary"
    CHAPTER_SUMMARY = "chapter_summary"
    CONSOLIDATE_QUOTES = "consolidate_quotes"
    AUTHOR_SUMMARY = "author_summary"
    MOTIF_EXTRACTION = "motif_extraction"
    MOTIF_CONSOLIDATION = "motif_consolidation"
    NOVEL_DESCRIPTION = "novel_description"


class Gemini:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.client = genai.Client(api_key=self.api_key)

    def prompt(
        self,
        model,
        prompt: str,
        instruction: str,
        character_name="",
        novel_title="",
        chapter_title: str = "",
    ) -> str:
        additional_instruction = self.get_additional_instruction(
            instruction, character_name, novel_title
        )

        response = self.client.models.generate_content(
            model=model, contents=additional_instruction + "\nQuotes\n:" + prompt
        )

        return response.text

    def generate_novel_description(
        self,
        model,
        instruction: str,
        author: str,
        title: str,
    ):
        additional_instruction = self.get_additional_instruction(
            instruction=instruction, author=author, novel_title=title
        )

        response = self.client.models.generate_content(
            model=model, contents=additional_instruction
        )

        return response.text

    def character_summary_mass_prompt(
        self,
        model,
        characters,
        associated_quotes: dict[str, list[dict]],
        instruction: str,
        book_title: str,
    ) -> dict[str, str]:
        character_ids = list(associated_quotes.keys())

        def send_request(character):
            id = character[0]
            name = character[1]
            additional_instruction = self.get_additional_instruction(
                instruction, character_name=character, novel_title=book_title
            )
            quotes_text = "\n".join(q["quote"] for q in associated_quotes[id])
            prompt = f"{additional_instruction}\n\nCharacter: {name}\nID: {id}\nBook: {book_title}\n\nQuotes:\n{quotes_text}"
            return (
                self.client.models.generate_content(
                    model=model,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        response_schema={
                            "type": "OBJECT",
                            "properties": {
                                "summary": {"type": "string"},
                                "description": {"type": "string"},
                            },
                            "required": ["summary", "description"],
                        },
                    ),
                )
                .candidates[0]
                .content.parts[0]
                .text
            )

        with ThreadPoolExecutor(max_workers=len(characters)) as executor:
            summaries = list(
                executor.map(
                    send_request,
                    zip(character_ids, [character["name"] for character in characters]),
                )
            )

        return dict(zip(character_ids, summaries))

    def generate_author_summary(
        self, model, instruction, extract: str, novel_title: str
    ):
        additional_instruction = self.get_additional_instruction(
            instruction=instruction, novel_title=novel_title
        )
        prompt = f"{additional_instruction}\n{extract}"
        try:
            response = (
                self.client.models.generate_content(
                    model=model,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        response_schema={
                            "type": "OBJECT",
                            "properties": {
                                "summary": {"type": "STRING"},
                            },
                            "required": ["summary"],
                        },
                    ),
                )
                .candidates[0]
                .content.parts[0]
                .text
            )
        except Exception as e:
            print(f"Error generating author summary: {e}")

        return response

    def chapter_summary_mass_prompt(
        self, model, chapters, instruction, book_title: str
    ):
        def send_request(item):
            ch_text, ch_idx, ch_title = item
            additional_instruction = self.get_additional_instruction(
                instruction=instruction, novel_title=book_title, chapter_title=ch_title
            )
            prompt = f"{additional_instruction}\n{ch_text}"
            try:
                response = (
                    self.client.models.generate_content(
                        model=model,
                        contents=prompt,
                        config=types.GenerateContentConfig(
                            response_mime_type="application/json",
                            response_schema={
                                "type": "OBJECT",
                                "properties": {
                                    "summary": {"type": "STRING"},
                                    "overview": {"type": "STRING"},
                                },
                                "required": ["summary", "overview"],
                            },
                        ),
                    )
                    .candidates[0]
                    .content.parts[0]
                    .text
                )
                if not response.strip():
                    print(f"WARNING: Empty response for chapter {ch_idx} ({ch_title})")
                return (ch_idx, response)
            except Exception as e:
                print(f"ERROR: Chapter {ch_idx} ({ch_title}) failed: {e}")
                return (ch_idx, "")

        with ThreadPoolExecutor(max_workers=len(chapters)) as executor:
            responses = list(executor.map(send_request, chapters))

        return responses

    def text_span_summary_mass_prompt(
        self, model, texts: list[str], instruction: str, characters: list[str]
    ) -> list[str]:
        def send_request(text):
            additional_instruction = self.get_additional_instruction(
                instruction, characters=characters
            )
            prompt = f"{additional_instruction}\n{text}"
            return (
                self.client.models.generate_content(
                    model=model,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        response_schema={
                            "type": "OBJECT",
                            "properties": {
                                "summary": {"type": "STRING"},
                                "headline": {
                                    "type": "STRING",
                                    "description": "A short 2-5 word narrative headline"
                                    "for the event, NOT the category name",
                                },
                                "category": {"type": "STRING"},
                                "characters": {
                                    "type": "ARRAY",
                                    "items": {"type": "STRING"},
                                },
                            },
                            "required": [
                                "summary",
                                "category",
                                "characters",
                                "headline",
                            ],
                        },
                    ),
                )
                .candidates[0]
                .content.parts[0]
                .text
            )

        with ThreadPoolExecutor(max_workers=len(texts)) as executor:
            summaries = list(executor.map(send_request, texts))

        return summaries

    def generate_motif_extraction(
        self, model, chunks: list, instruction: str, novel_title: str
    ):
        def send_request(chunk):
            additional_instruction = self.get_additional_instruction(
                instruction, novel_title=novel_title
            )
            prompt = f"{additional_instruction}\n{chunk}"
            return (
                self.client.models.generate_content(
                    model=model,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        response_schema={
                            "type": "OBJECT",
                            "properties": {
                                "motifs": {"type": "ARRAY", "items": {"type": "STRING"}}
                            },
                            "required": ["motifs"],
                        },
                    ),
                )
                .candidates[0]
                .content.parts[0]
                .text
            )

        with ThreadPoolExecutor(max_workers=len(chunks)) as executor:
            all_motifs = list(executor.map(send_request, chunks))

        return all_motifs

    def generate_motif_consolidation(
        self,
        model,
        motifs: list,
        instruction: str,
        novel_title: str,
    ):
        additional_instruction = self.get_additional_instruction(
            instruction, novel_title
        )
        prompt = f"{additional_instruction}\n{(', ').join(motifs)}"
        response = self.client.models.generate_content(
            model=model,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema={
                    "type": "OBJECT",
                    "properties": {
                        "motif_groups": {
                            "type": "ARRAY",
                            "items": {
                                "type": "OBJECT",
                                "properties": {
                                    "category": {"type": "STRING"},
                                    "motifs": {
                                        "type": "ARRAY",
                                        "items": {"type": "STRING"},
                                    },
                                    "summary": {"type": "STRING"},
                                },
                                "required": ["category", "motifs", "summary"],
                            },
                        }
                    },
                    "required": ["motif_groups"],
                },
            ),
        )

        candidate = response.candidates[0]
        if candidate.finish_reason != "STOP":
            print(f"WARNING: Motif consolidation truncated (finish_reason={candidate.finish_reason}), retrying with fewer motifs")
            unique_motifs = list(set(motifs))
            prompt = f"{additional_instruction}\n{(', ').join(unique_motifs)}"
            response = self.client.models.generate_content(
                model=model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema={
                        "type": "OBJECT",
                        "properties": {
                            "motif_groups": {
                                "type": "ARRAY",
                                "items": {
                                    "type": "OBJECT",
                                    "properties": {
                                        "category": {"type": "STRING"},
                                        "motifs": {
                                            "type": "ARRAY",
                                            "items": {"type": "STRING"},
                                        },
                                        "summary": {"type": "STRING"},
                                    },
                                    "required": ["category", "motifs", "summary"],
                                },
                            }
                        },
                        "required": ["motif_groups"],
                    },
                ),
            )
            candidate = response.candidates[0]
            if candidate.finish_reason != "STOP":
                raise RuntimeError(f"Motif consolidation failed after retry: finish_reason={candidate.finish_reason}")

        return candidate.content.parts[0].text

    def consolidate_quotes(self, model, network: dict, instruction: str):
        additional_instruction = self.get_additional_instruction(instruction)
        prompt = f"{additional_instruction}\n{str(json.dumps(network))}"
        return (
            self.client.models.generate_content(
                model=model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                ),
            )
            .candidates[0]
            .content.parts[0]
            .text
        )

    def get_models(self):
        return self.client.models.list()

    def get_additional_instruction(
        self,
        instruction: str,
        character_name: str = "",
        novel_title: str = "",
        chapter_title: str = "",
        characters: list[str] = [],
        author: str = "",
    ) -> str:
        additional_instruction = ""
        if instruction == PromptInstruction.EXCERPT_SUMMARY:
            additional_instruction = self.excerpt_summary_prompt(characters)
        if instruction == PromptInstruction.CHARACTER_SUMMARY:
            additional_instruction = self.character_summary_prompt(
                character_name, novel_title
            )
        if instruction == PromptInstruction.CHAPTER_SUMMARY:
            additional_instruction = self.chapter_summary_prompt(
                novel_title, chapter_title
            )
        if instruction == PromptInstruction.CONSOLIDATE_QUOTES:
            additional_instruction = self.consolidate_quotes(novel_title)
        if instruction == PromptInstruction.AUTHOR_SUMMARY:
            additional_instruction = self.author_summary_prompt(novel_title)
        if instruction == PromptInstruction.MOTIF_EXTRACTION:
            additional_instruction = self.motif_analysis_prompt()
        if instruction == PromptInstruction.MOTIF_CONSOLIDATION:
            additional_instruction = self.consolidate_motifs_prompt(title=novel_title)
        if instruction == PromptInstruction.NOVEL_DESCRIPTION:
            additional_instruction = self.novel_description_prompt(
                author=author, novel_title=novel_title
            )
        return additional_instruction

    @staticmethod
    def consolidate_quotes(novel_title: str):
        return f"""You are an expert in literary analysis and named entity resolution.
                Task:
                You will be given quotes. Each entity has an associated quote count. Entity resolution has already been performed, but some duplicates remain — your job is to identify entities that refer to the same character and group them together.

                Use your knowledge of the novel to inform merging decisions (e.g. knowing that "Heathcliff" and "Mr. Heathcliff" are the same person, or that "Henry" and "Dr. Jekyll" are not).

                Rules:
                - Only merge entities you are confident refer to the same character. When in doubt, keep them separate.
                - A good way to increase your confidence is to look at characters that may be substrings of other characters.
                - Do not invent new names. The canonical name for each group must be the variant with the highest quote count.
                - Return the result in exactly the same format as the input.
                - Do not remove any entities UNLESS you are confident they are in the quotes erroneously, an example might be a non-speaking character that has been identified as a speaking entity, those can be removed — every input entity must appear in the output, either as a canonical name or mapped to one — unless you are confident it is not a genuine speaking character (e.g. a pet, a person being addressed but not speaking, or a character from a recited poem). In that case, remove it and list the removed entities with a brief reason at the end of your response.
                
                Title: {novel_title}
                Here are the quotes to consolidate:
                """

    @staticmethod
    def novel_description_prompt(author: str, novel_title: str):
        return f"""You are an expert in literary analysis.
        You will be given the title and author of a novel.
        Your task is to generate a concise description of the novel suitable
        for a landing page or book card.
        Be specific, name characters and locations rather than describing them
        generally.
        Your description should include the year of publication and any well
        known context behind the novel's creation.

        The description should cover the premise, setting, and general tone
        of the novel in 6-7 sentences, approximately 100-120 words.

        Rules:
        - Do NOT acknowledge the prompt. Just generate the description.
        - Do NOT include spoilers or reveal major plot twists.
        - Write in an accessible, informative tone suitable for readers
        who may not have read the novel.
        - Do NOT use markdown formatting, headers, or bullet points.
        - Reference the author by surname after the first mention.
        - Ground the description in the novel's content, not its
        literary reception or cultural impact.

        Novel title: {novel_title}
        Author: {author}
        """

    @staticmethod
    def excerpt_summary_prompt(characters):
        return f"""You are an expert in literary summarization.
                    Task(s):
                    - Summarize this short novel excerpt in a single concise sentence of under 25 words.
                    - Focus on the key emotional or narrative event.
                    - Provide a short, two to five word narrative headline for the event.
                    - Detail the characters involved. A list of characters will be provided to you,
                    you must only use those character names exactly as how they are given to you.
                    Do not invent names.
                    - Categorize the excerpt as one of the following types of narrative event:

                    Death — character death or loss
                    Conflict — arguments, fights, confrontations
                    Discovery — revelations, secrets uncovered, key information learned
                    Reunion — characters meeting again or coming together
                    Departure — characters leaving, journeys beginning, separations
                    Romance — love declarations, proposals, romantic moments
                    Betrayal — deception revealed, trust broken
                    Transformation — character change, disguise, identity shift
                    Peril — danger, threat, chase, narrow escape
                    Resolution — problems solved, peace restored, conclusions reached

                    Rules:
                    - Reference characters by their full canonical names where possible.
                    - Do not add interpretation beyond what is present in the text.
                    - Do not make any reference to the prompt itself.
                    - Only give the summarisation, nothing else.
                    - The response must be in the following JSON format: 
                    "summary": "EXCERPT SUMMARY",
                    "category": "EXCERPT CATEGORY",
                    "headline": "EXCERPT HEADLINE",
                    "characters": ["CHARACTER_1", "CHARACTER_2", ...]

                    Example output:
                    "summary": "Alice shrinks after drinking from a mysterious bottle, unable to reach the key on the table.",
                    "headline": "Alice's Shrinking Potion",
                    "category": "Transformation",
                    "characters": ["Alice"]

                    Character List: {', '.join(characters)}
                    Here is the excerpt to summarize:
            """

    @staticmethod
    def character_summary_prompt(character_name: str = "", novel_title: str = ""):
        return f"""You are an expert in literary analysis and summarisation.
                You will be given a series of quotes from a character from a given story.
                Each quote is seperated by a newline.
                The name of the story and the character's name will be provided alongside the quotes.
                It is your job to generate a summary of this character. The summary should span roughly three to four
                paragraphs, approximately 300-400 words. You should seperate the paragraphs with a newline symbol.
                If a character is a relatively minor one, then the above instruction regarding summary length need not apply.
                Side characters can have shorter analyses, whereas major characters demand the full length as described.
                You should also generate a short summary, a sentence at most.
                This sentence should describe either their role in the story, i.e. antagonist or protagonist, or
                their relation to other characters in the story i.e. wife, husband, mother etc.

                Rules:
                - After the first named reference, exclusively refer to the character by their pronoun.
                i.e. He, his, himself etc.
                - Ground your analysis in the quotes and any pre-existing knowledge you may have of the character.
                You should draw on the content and sentiment of the quotes in your analysis, but paraphrase them 
                as opposed to quoting them directly.
                - You MUST make use of newline symbols to break up your summary.
                - Do NOT directly quote the characters dialogue. Instead, describe what they say and how they say it
                in your own words.
                - You may make use of pre-existing knowledge of the text or character.
                - Address the character's key relationships, their role in the narrative, their emotional
                arc, and how they relate to the broader themes of the work.
                - If limited quotes are available, acknowledge the character's smaller role and focus on
                what can be reasonably inferred from the available dialogue.
                - Write in an accessible but analytically informed tone suitable for undergraduate readers.
                - Do not use markdown formatting, headers, or bullet points.
                - Do not make any reference to the prompt whatsoever.
                - Provide ONLY the character summary and short description.
                - The response must be in the following JSON format: 
                "summary": "LONG SUMMARY",
                "description": "SHORT DESCRIPTION" 

                Below are the quotes, the name of the title, and the name of the character:
                Character name: {character_name}
                Novel title: {novel_title}
        """

    @staticmethod
    def chapter_summary_prompt(chapter_title: str, novel_title: str = ""):
        return f"""You are an expert in literary analysis and summarisation.
        You will be given a full chapter from a novel, and its title.
        It is your job to generate a summary that spans 3-4 paragraphs
        or approximately 250-350 words for this chapter. You will also generate a short overview of the 
        chapter that spans 1-2 sentences.
        You may make use of pre-existing knowledge of the novel if you possess it.

        Rules:
        - Do NOT acknowledgement the prompt. Just generate the summary
        and short description and return it in the format described below.
        - You may make use of pre-existing knowledge of the novel if you have it,
        though try and make the most use of the given chapter as possible.
        - Write in an accessible but informed tone suitable for casual readers.
        - Make no use whatsoever of markdown formatting, heading, or bullet points.
        - The response must be in the following JSON format: {{
            "summary": "LONG SUMMARY",
            "overview": "SHORT OVERVIEW"
        }}
        - Do NOT take on the tone of the novel in your summary. Keep your summary factual,
        and keep your tone seperate from the source. 
        - Summarise the narrative / plot points. Do NOT allude to literary devices.
        - Do NOT allude to any future happenings. Ground your summary in what occured
        in the current chapter and optionally how it may relate to prior chapters when
        it fits.
        - You MUST make use of newlines to seperate paragraphs or key narrative beats in your summary.

        Novel title: {novel_title}
        Chapter title: {chapter_title}
        """

    @staticmethod
    def author_summary_prompt(novel_title: str = ""):
        return f"""You are an expert in text summarisation.
        You will be given an extract from wikipedia regarding the author of a novel, the title
        of which you will also be provided with.
        Your task is to generate a summary of the information in the extract. 

        Rules
        - Do NOT acknowledgement the prompt. Just generate the summary
        and short description and return it in the format described below.
        - Summarise the extract given only
        - You CAN and SHOULD make SOME reference to the novel given.  
        - Do not take on the tone of the Wikipedia or novel, remain factual.
        - Your summary should span 2-3 moderate length paragraphs.
        - Make NO use of markdown formatting. You can use newlines.

        Novel Title: {novel_title}
        Below is the extract for summarisation
        """

    # Some prompt details taken from here:
    # https://arxiv.org/pdf/2504.21742
    @staticmethod
    def motif_analysis_prompt():
        return """
        Identify literary motifs (recurring recognizable and meaningful
        patterns of meaning) from the provided text, expressed as concise,
        short phrases. Only extract motifs from the current text, ignoring
        the preceding context. Do not mention character names, and refrain
        from providing any additional commentary beyond the list of motifs.

        Rules:
        - Do NOT acknowledge the prompt. Just identify the motifs from the 
        provided text
        - Use only the given provided text, do not use prior context.
        - Do not mention character names
        - Provide your response in the following JSON format:
            "motifs": ["motif one", "motif two", ...]
        """

    @staticmethod
    def consolidate_motifs_prompt(title: str):
        return f"""  
        You are an expert in literary analysis.
        You will be given a list of literary motifs. Your task is to consolidate
        this list into 5-10 groups of overarching motif categories.
        You must map the overarching motif category to the motifs you believe
        best belong to that category.
        You must also provide a 2-3 sentence summary, contextualizing this motif
        group and how it relates to the novel being analysed. To aid in this task,
        you will be provided with the title of the novel. 

        Rules:
        - Do NOT acknowledge the prompt. Just identify the categories of 
        motifs from the provided list and complete the mapping.
        - Provide your response in the following JSON format:
            "motif_groups": [
                {{"category": "OVERARCHING CATEGORY", "motifs": ["motif one", "motif two", ...], "summary": "MOTIF GROUP SUMMARY"}},
                {{"category": "OVERARCHING CATEGORY", "motifs": ["motif three", "motif four", ...], "summary": "MOTIF GROUP SUMMARY"}},
                ...
            ]

        Novel Title: {title}
        """
