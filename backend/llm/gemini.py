import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

class Gemini():
    def __init__(self):
        self.api_key = os.getenv('GEMINI_API_KEY')
        self.client = genai.Client(api_key=self.api_key)

    def prompt(self, model, prompt: str) -> str:
        response = self.client.models.generate_content(
            model=model,
            contents=prompt
        )

        return response.text
    
g: Gemini = Gemini()
res = g.prompt("gemini-3-flash-preview", """You are an expert in literary named-entity resolution.

Task:
I will give you a list of PERSON entities extracted from the novel "Dracula" along with their occurrence counts.
Many entries refer to the same real character but appear under different surface forms
(e.g., first name only, surname only, possessive forms, titles, partial names, or capitalization differences).

Your job is to MERGE entities that refer to the same person.

Rules:
- Use the FULL CANONICAL NAME of the person (e.g., "Abraham Van Helsing", "Mina Harker", "Jonathan Harker").
- Combine the counts of all merged entries.
- Do NOT invent new people.
- Do NOT merge different people who share a first name only (e.g., "John" alone is ambiguous).
- If an entity is clearly noise or not a real person, keep it separate.
- Output each merged person ONCE.
- After merging, REMOVE all aliases that contributed to a canonical name

Output format (strict):
Full Name: total_count
(one per line, no bullet points, no extra text)

Here is the entity list to merge:

Van Helsing (PERSON): 276
Lucy (PERSON): 275
Mina (PERSON): 192
Jonathan (PERSON): 173
Arthur (PERSON): 135
Harker (PERSON): 114
Seward (PERSON): 99
Godalming (PERSON): 81
John (PERSON): 64
Quincey (PERSON): 55
Morris (PERSON): 50
Renfield (PERSON): 40
Westenra (PERSON): 27
Dracula (PERSON): 25
Quincey Morris (PERSON): 22
Helsing (PERSON): 21
Van (PERSON): 20
Lucy Westenra (PERSON): 13
Mina Harker (PERSON): 10
Jonathan Harker (PERSON): 5
Arthur Holmwood (PERSON): 9
John Seward (PERSON): 8
Abraham Van Helsing (PERSON): 3
Wilhelmina Murray (PERSON): 1
Count Dracula (PERSON): 1
""")
print(res)
        
