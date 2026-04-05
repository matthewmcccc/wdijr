import re

def clean_string(s: str) -> str:
    """
    Removes all newspaces, punctuation, apostrophes, and converts
    the given string to lower case.

    :param s: String to be cleaned
    :type s: str
    :return: Cleaned string
    :rtype: str
    """
    s = s.replace("\n", " ").replace("’s", "").replace("'s", "").lower()
    return re.sub(r"\p{P}+", "", s)