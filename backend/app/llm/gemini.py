import os
import time
from google import genai
from dotenv import load_dotenv
from concurrent.futures import ThreadPoolExecutor

load_dotenv()


class Gemini:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.client = genai.Client(api_key=self.api_key)

    def prompt(
        self, model, prompt: str, instruction: str, character_name="", novel_title=""
    ) -> str:
        additional_instruction = self.get_additional_instruction(instruction, character_name, novel_title)

        response = self.client.models.generate_content(
            model=model, contents=additional_instruction + "\nQuotes\n:" + prompt
        )

        return response.text

    def character_summary_mass_prompt(self, model, associated_quotes: dict[str, list[dict]], instruction: str, book_title: str) -> dict[str, str]:
        
        characters = list(associated_quotes.keys())
        
        def send_request(character):
            additional_instruction = self.get_additional_instruction(instruction, character_name=character, novel_title=book_title)
            quotes_text = "\n".join(q["quote"] for q in associated_quotes[character])
            prompt = f"{additional_instruction}\n\nCharacter: {character}\nBook: {book_title}\n\nQuotes:\n{quotes_text}"
            return self.client.models.generate_content(
                model=model, contents=prompt
            ).candidates[0].content.parts[0].text

        with ThreadPoolExecutor(max_workers=len(characters)) as executor:
            summaries = list(executor.map(send_request, characters))

        return dict(zip(characters, summaries))

    def get_models(self):
        return self.client.models.list()

    def get_additional_instruction(self, instruction: str, character_name: str, novel_title: str) -> str:
        additional_instruction = ""
        if instruction == "excerpt_summary":
            additional_instruction = self.excerpt_summary_prompt()
        if instruction == "character_summary":
            additional_instruction = self.character_summary_prompt(character_name, novel_title)
        return additional_instruction

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
