from enum import StrEnum, auto

class TaskState(StrEnum):
    PENDING = auto()
    PROCESSING = auto()
    SUCCESS = auto()
    FAILURE = auto()