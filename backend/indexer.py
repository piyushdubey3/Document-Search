import re


def tokenize(text):
    text = text.lower()

    words = re.findall(r"\b[a-zA-Z]+\b", text)

    return words


def build_inverted_index(text):
    words = tokenize(text)

    inverted_index = {}

    for position, word in enumerate(words):
        if word not in inverted_index:
            inverted_index[word] = []

        inverted_index[word].append(position)

    return inverted_index

def find_phrase_positions(inverted_index, phrase_words):
    if not phrase_words:
        return []

    for word in phrase_words:
        if word not in inverted_index:
            return []

    first_word_positions = inverted_index[phrase_words[0]]
    phrase_start_positions = []

    position_sets = {}

    for word in phrase_words[1:]:
        position_sets[word] = set(inverted_index[word])

    for start_position in first_word_positions:
        phrase_found = True

        for offset in range(1, len(phrase_words)):
            word = phrase_words[offset]

            if start_position + offset not in position_sets[word]:
                phrase_found = False
                break

        if phrase_found:
            phrase_start_positions.append(start_position)

    return phrase_start_positions