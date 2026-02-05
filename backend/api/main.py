from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from nlp.plot_sentiment import PlotSentiment
from parsers.epub import Epub
import os

app = FastAPI()

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "API is running"}
    

@app.post("/upload")
async def upload(file: UploadFile):
    try:
        suffix = os.path.splittext(file.filename)
        print(f"suffix: {suffix}")
    except Exception:
        raise HTTPException(status_code=500, detail="Couldn't read uploaded file")
    return {"filename": file.filename }