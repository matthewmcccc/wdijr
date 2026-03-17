from abc import ABC, abstractmethod


class Book(ABC):
    @abstractmethod
    def set_title(self):
        pass

    @abstractmethod
    def set_chapters(self):
        pass

    @abstractmethod
    def set_author(self):
        pass


class Chapter:
    def __init__(self, index, title, item):
        self.index: int = index
        self.title: str = title
        self.item: str = item

    def get_title(self) -> str:
        return self.title

    def get_content(self) -> str:
        return self.content

    def __str__(self) -> str:
        return f"Index: {self.index} -- Title: {self.title} -- Item: {self.item}"
