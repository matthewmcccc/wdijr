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
        self, model, texts: list[str], instruction: str
    ) -> list[str]:
        def send_request(text):
            additional_instruction = self.get_additional_instruction(instruction)
            prompt = f"{additional_instruction}\n{text}"
            return (
                self.client.models.generate_content(model=model, contents=prompt)
                .candidates[0]
                .content.parts[0]
                .text
            )

        with ThreadPoolExecutor(max_workers=len(texts)) as executor:
            summaries = list(executor.map(send_request, texts))

        return summaries
    
    def consolidate_quotes(
        self, model, network: dict, instruction: str
    ):
        additional_instruction = self.get_additional_instruction(instruction)
        prompt=f"{additional_instruction}\n{str(json.dumps(network))}"
        return (
            self.client.models.generate_content(
                model=model, 
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                ),
            )
            .candidates[0].content.parts[0].text
        )

    def get_models(self):
        return self.client.models.list()

    def get_additional_instruction(
        self,
        instruction: str,
        character_name: str = "",
        novel_title: str = "",
        chapter_title: str = "",
    ) -> str:
        additional_instruction = ""
        if instruction == PromptInstruction.EXCERPT_SUMMARY:
            additional_instruction = self.excerpt_summary_prompt()
        if instruction == PromptInstruction.CHARACTER_SUMMARY:
            additional_instruction = self.character_summary_prompt(
                character_name, novel_title
            )
        if instruction == PromptInstruction.CHAPTER_SUMMARY:
            additional_instruction = self.chapter_summary_prompt(
                novel_title, chapter_title
            )
        if instruction == PromptInstruction.CONSOLIDATE_QUOTES:
            additional_instruction = self.consolidate_quotes(
                novel_title
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
    def excerpt_summary_prompt():
        return """You are an expert in literary summarization.
                    Task:
                    Summarize this short novel excerpt in a single concise sentence of under 25 words.
                    Focus on the key emotional or narrative event.

                    Rules:
                    - Reference characters by their full canonical names where possible.
                    - Do not add interpretation beyond what is present in the text.
                    - Do not make any reference to the prompt itself.
                    - Only give the summarisation, nothing else.

                    Here is the excerpt to summarize:
            """

    @staticmethod
    def character_summary_prompt(character_name: str = "", novel_title: str = ""):
        return f"""You are an expert in literary analysis and summarisation.
                You will be given a series of quotes from a character from a given story.
                Each quote is seperated by a newline.
                The name of the story and the character's name will be provided alongside the quotes.
                It is your job to generate a summary of this character. The summary should span roughly two
                paragraphs, approximately 150-200 words. You should also generate a short summary, a sentence at most.
                This sentence should describe either their role in the story, i.e. antagonist or protagonist, or
                their relation to other characters in the story i.e. wife, husband, mother etc.

                Rules:
                - After the first named reference, exclusively refer to the character by their pronoun.
                i.e. He, his, himself etc.
                - Ground your analysis primarily in the provided quotes, using broader literary knowledge
                only to contextualise. Where appropriate, briefly reference specific moments from the
                provided quotes to support your characterisation.
                You must make reference to at least SOME of the quotes provided (pick 2-4).
                - You make MINIMAL USE of pre-existing knowledge of the text
                - Address the character's key relationships, their role in the narrative, their emotional
                arc, and how they relate to the broader themes of the work.
                - If limited quotes are available, acknowledge the character's smaller role and focus on
                what can be reasonably inferred from the available dialogue.
                - Write in an accessible but analytically informed tone suitable for undergraduate readers.
                - Do not use markdown formatting, headers, or bullet points.
                - Do not make any reference to the prompt whatsoever.
                - Provide ONLY the character summary.
                - The response must be in the following JSON format: "summary": *LONG SUMMARY IN DOUBLE QUOTES*,
                "description": *SHORT DESCRIPTION IN DOUBLE QUOTES* 

                Below are the quotes, the name of the title, and the name of the character:
                Character name: {character_name}
                Novel title: {novel_title}
        """

    @staticmethod
    def chapter_summary_prompt(chapter_title: str, novel_title: str = ""):
        return f"""You are an expert in literary analysis and summarisation.
        You will be given a full chapter from a novel, and its title.
        It is your job to generate a summary that spans 2-3 paragraphs
        for this chapter. You will also generate a short overview of the 
        chapter that spans 1-2 sentences.
        You may make use of pre-existing knowledge of the novel if you possess it.

        Rules:
        - Do NOT acknowledgement the prompt. Just generate the summary
        and short description and return it in the format described below.
        - You may make use of pre-existing knowledge of the novel if you have it,
        though try and make the most use of the given chapter as possible.
        - Write in an accessible but informed tone suitable for casual readers.
        - Make no use whatsoever of markdown formatting, heading, or bullet points.
        - The response must be in the following JSON format: {{"summary": *LONG SUMMARY IN DOUBLE QUOTES*,
        "overview": *SHORT OVERVIEW IN DOUBLE QUOTES*}}
        - Do NOT take on the tone of the novel in your summary. Keep your summary factual,
        and keep your tone seperate from the source. 
        - Summarise the narrative / plot points. Do NOT allude to literary devices.
        - Do NOT allude to any future happenings. Ground your summary in what occured
        in the current chapter and optionally how it may relate to prior chapters when
        it fits.
        - Seperate paragraphs or key beats in your summary by newlines where applicable.

        Novel title: {novel_title}
        Chapter title: {chapter_title}
        """
