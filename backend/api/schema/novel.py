from pydantic import BaseModel

class Novel(BaseModel):
    id: int
    title: str
    author: str