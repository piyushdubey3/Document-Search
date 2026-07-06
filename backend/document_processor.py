from pypdf import PdfReader

from indexer import build_inverted_index , tokenize

def process_pdf(file_path):
    reader = PdfReader(file_path)

    text_parts = []
    position_pages = {}
    current_position = 0

    for page_number, page in enumerate(
        reader.pages,
        start=1
    ):
        page_text = page.extract_text()

        if page_text:
            text_parts.append(page_text)

            page_words = tokenize(page_text)

            for _ in page_words:
                position_pages[current_position] = page_number
                current_position += 1

    text = "\n".join(text_parts)

    if not text.strip():
        raise ValueError("No extractable text found in PDF")

    inverted_index = build_inverted_index(text)

    return {
        "text": text,
        "pages": len(reader.pages),
        "inverted_index": inverted_index,
        "position_pages": position_pages
    }