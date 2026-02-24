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

    def prompt(self, model, prompt: str) -> str:
        response = self.client.models.generate_content(model=model, contents=prompt)

        return response.text

    def mass_prompt(self, model, prompts: list[str], instruction: str) -> list[str]:
        responses = []

        additional_instruction = ""
        if instruction == "excerpt_summary":
            additional_instruction = self.excerpt_summary_prompt()

        def send_request(prompt):
            return self.client.models.generate_content(
                model=model, contents=additional_instruction + "\n" + prompt
            ).candidates[0].content.parts[0].text

        with ThreadPoolExecutor(max_workers=len(prompts)) as executor:
            responses = list(executor.map(send_request, prompts))

        return responses

    def get_models(self):
        return self.client.models.list()

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
