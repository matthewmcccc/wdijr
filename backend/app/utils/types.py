from enum import Enum, auto


class PromptInstruction(str, Enum):
    EXCERPT_SUMMARY = auto()
    CHARACTER_SUMMARY = auto()
    CHAPTER_SUMMARY = auto()
    CONSOLIDATE_QUOTES = auto()
    AUTHOR_SUMMARY = auto()
    MOTIF_EXTRACTION = auto()
    MOTIF_CONSOLIDATION = auto()
    NOVEL_DESCRIPTION = auto()
    CHARACTER_CONSOLIDATION = auto()


class GeminiModel(Enum):
    GEMINI_2_5_FLASH = "gemini-2.5-flash"
    GEMINI_3_1_PRO = "gemini-3.1-pro"
