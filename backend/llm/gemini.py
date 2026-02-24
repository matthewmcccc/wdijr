import os
import time
from google import genai
from dotenv import load_dotenv

load_dotenv()


class Gemini:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.client = genai.Client(api_key=self.api_key)

    def prompt(self, model, prompt: str) -> str:
        response = self.client.models.generate_content(model=model, contents=prompt)

        return response.text

    def mass_prompt(self, model, prompts: list[str], instruction: str) -> str:
        responses = []

        if instruction == "excerpt_summary":
            additional_instruction = self.excerpt_summary_prompt

        for prompt in prompts:
            response = self.client.models.generate_content(
                model=model, contents=additional_instruction + "\n" + prompt
            )
            responses.append(response)

        return responses

    def get_models(self):
        return self.client.models.list()

    @staticmethod
    def excerpt_summary_prompt():
        return """You are an expert in literary summarization.
                    Task:
                    I will give you a short excerpt from a novel. This excerpt is less than a thousand words and has been marked
                    as a period of interest with respect to valence (emotional sentiment).
                    Your job is to meaningfully summarize the text. Keep the summary to less than 150 words.

                    Rules:
                    - Focus on what happens emotionally and narratively in the passage.
                    - Reference characters by their full canonical names where possible.
                    - Note any significant shifts in tone, mood, or sentiment.
                    - Do not add interpretation beyond what is present in the text.
                    - Write in clear, concise prose — no bullet points or lists.
                    - Do not make any reference to the promptee or the prompt itself
                    - Only give the summarisation, nothing else.

                    Here is the excerpt to summarize:
            """
