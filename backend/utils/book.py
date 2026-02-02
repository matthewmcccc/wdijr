class Book:
    def __init__(self):
        pass

    def set_title(self):
        raise NotImplementedError
    
    def set_chapters(self):
        raise NotImplementedError

    def set_author(self):
        raise NotImplementedError
    

class Chapter:
    def __init__(self, index, title, item):
        self.index: int = index
        self.title: str = title
        self.item: str = item

    def get_title(self) -> str:
        return self.title

    def get_content(self) -> str:
        return self.content