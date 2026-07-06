from flask import Flask, request, jsonify , send_from_directory
from document_processor import process_pdf
from werkzeug.utils import secure_filename
from flask_cors import CORS
import os
import json
from indexer import tokenize,find_phrase_positions

app = Flask(__name__)
CORS(
    app,
    resources={
        r"/*": {
            "origins": [
                "http://localhost:5173",
                "http://127.0.0.1:5173"
            ]
        }
    }
)
document_indexes={}
document_position_pages={}

UPLOAD_FOLDER = "uploads"
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
INDEX_FOLDER="indexes"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(INDEX_FOLDER, exist_ok=True)

def load_saved_indexes():
    if not os.path.exists(INDEX_FOLDER):
        os.makedirs(INDEX_FOLDER)

    for filename in os.listdir(INDEX_FOLDER):
        if filename.endswith(".json"):
            index_path = os.path.join(INDEX_FOLDER, filename)

            try:
                with open(index_path, "r", encoding="utf-8") as index_file:
                    saved_data = json.load(index_file)

                pdf_filename = filename[:-5]
                if "inverted_index" in saved_data:
                    document_indexes[pdf_filename] = (
                        saved_data["inverted_index"]
                    )

                    document_position_pages[pdf_filename] = (
                        saved_data.get("position_pages", {})
                    )
                else:
                    document_indexes[pdf_filename] = saved_data

            except (json.JSONDecodeError, OSError):
                print(f"Could not load index: {filename}")


@app.route("/")
def home():
    return "Document Search Engine Backend is Running"


@app.route("/upload", methods=["POST"])
def upload_file():
    if "files" not in request.files:
        return jsonify({
            "error": "No files uploaded"
        }), 400

    files = request.files.getlist("files")

    if not files or all(file.filename == "" for file in files):
        return jsonify({
            "error": "No files selected"
        }), 400

    results = []

    for file in files:
        if file.filename == "":
            continue

        filename = secure_filename(file.filename)

        if filename == "":
            results.append({
                "original_filename": file.filename,
                "status": "failed",
                "error": "Invalid filename"
            })
            continue

        if not filename.lower().endswith(".pdf"):
            results.append({
                "filename": filename,
                "status": "failed",
                "error": "Only PDF files are allowed"
            })
            continue

        file_path = os.path.join(
            app.config["UPLOAD_FOLDER"],
            filename
        )

        index_path = os.path.join(
            INDEX_FOLDER,
            filename + ".json"
        )

        if (
            os.path.exists(file_path)
            or os.path.exists(index_path)
        ):
            results.append({
                "filename": filename,
                "status": "failed",
                "error": (
                    "A document with this filename "
                    "already exists"
                )
            })
            continue

        try:
            file.save(file_path)

            processed_document = process_pdf(file_path)

            text = processed_document["text"]
            pages = processed_document["pages"]
            inverted_index = (
                processed_document["inverted_index"]
            )
            position_pages= processed_document["position_pages"]

            with open(
                index_path,
                "w",
                encoding="utf-8"
            ) as index_file:
                json.dump(
                    {"inverted_index": inverted_index,
                     "position_pages":position_pages
                    },
                    index_file,
                    indent=4,
                    ensure_ascii=False
                )

            document_indexes[filename] = inverted_index
            document_position_pages[filename] = position_pages

            results.append({
                "filename": filename,
                "status": "success",
                "pages": pages,
                "characters_extracted": len(text),
                "unique_words": len(inverted_index)
            })

        except ValueError as error:
            if os.path.exists(file_path):
                os.remove(file_path)

            if os.path.exists(index_path):
                os.remove(index_path)

            document_indexes.pop(filename, None)
            document_position_pages.pop(filename, None)

            results.append({
                "filename": filename,
                "status": "failed",
                "error": str(error)
            })

        except Exception as error:
            if os.path.exists(file_path):
                os.remove(file_path)

            if os.path.exists(index_path):
                os.remove(index_path)

            document_indexes.pop(filename, None)
            document_position_pages.pop(filename, None)

            results.append({
                "filename": filename,
                "status": "failed",
                "error": "Failed to process PDF",
                "details": str(error)
            })

    successful_uploads = sum(
        1
        for result in results
        if result["status"] == "success"
    )

    failed_uploads = sum(
        1
        for result in results
        if result["status"] == "failed"
    )

    return jsonify({
        "message": "Upload processing completed",
        "successful_uploads": successful_uploads,
        "failed_uploads": failed_uploads,
        "results": results
    }), 200

@app.route("/search", methods=["GET"])
def search():
    query = request.args.get("q", "").strip().lower()

    if query == "":
        return jsonify({
            "error": "Search query is required"
        }), 400

    query_words = tokenize(query)

    if not query_words:
        return jsonify({
            "error": "No valid search words found"
        }), 400

    results = []

    for filename, inverted_index in document_indexes.items():
        matched_words = {}
        total_occurrences = 0
        matched_pages = set()
        match_occurrences = []

        position_pages = document_position_pages.get(
            filename,
            {}
        )

        for word in query_words:
            if word in inverted_index:
                positions = inverted_index[word]

                word_pages = set()

                for position in positions:
                    page_number = position_pages.get(
                        str(position)
                    )

                    if page_number is None:
                        page_number = position_pages.get(
                            position
                        )

                    if page_number is not None:
                        word_pages.add(page_number)
                        matched_pages.add(page_number)
                        match_occurrences.append({
                            "word": word,
                            "position": position,
                            "page": page_number
                        })

                matched_words[word] = {
                    "count": len(positions),
                    "positions": positions,
                    "pages": sorted(word_pages)
                }

                total_occurrences += len(positions)

        if matched_words:
            match_occurrences.sort(
                key=lambda occurrence: occurrence["position"]
            )
            unique_query_words = set(query_words)

            match_percentage = (
                len(matched_words)
                / len(unique_query_words)
            ) * 100

            results.append({
                "filename": filename,
                "matched_words": matched_words,
                "words_matched": len(matched_words),
                "total_query_words": len(unique_query_words),
                "match_percentage": round(
                    match_percentage,
                    2
                ),
                "total_occurrences": total_occurrences,
                "pages": sorted(matched_pages),
                "match_occurrences": match_occurrences
            })

    results.sort(
        key=lambda result: (
            result["match_percentage"],
            result["total_occurrences"]
        ),
        reverse=True
    )

    return jsonify({
        "query": query,
        "query_words": query_words,
        "total_documents_found": len(results),
        "results": results
    })


@app.route("/phrase-search", methods=["GET"])
def phrase_search():
    query = request.args.get("q", "").strip().lower()

    if query == "":
        return jsonify({
            "error": "Phrase query is required"
        }), 400

    phrase_words = tokenize(query)

    if len(phrase_words) < 2:
        return jsonify({
            "error": (
                "Phrase search requires at least "
                "two valid words"
            )
        }), 400

    results = []

    for filename, inverted_index in document_indexes.items():
        phrase_positions = find_phrase_positions(
            inverted_index,
            phrase_words
        )

        if phrase_positions:
            position_pages = document_position_pages.get(
                filename,
                {}
            )

            matched_pages = set()
            match_occurrences = []

            for position in phrase_positions:
                page_number = position_pages.get(
                    str(position)
                )

                if page_number is None:
                    page_number = position_pages.get(
                        position
                    )

                if page_number is not None:
                    matched_pages.add(page_number)

                    match_occurrences.append( {
                        "position": position,
                        "page": page_number
                    })

            results.append({
                "filename": filename,
                "count": len(phrase_positions),
                "positions": phrase_positions,
                "pages": sorted(matched_pages),
                "match_occurrences": match_occurrences
            })

    results.sort(
        key=lambda result: result["count"],
        reverse=True
    )

    return jsonify({
        "query": query,
        "phrase_words": phrase_words,
        "total_documents_found": len(results),
        "results": results
    })

@app.route("/documents", methods=["GET"])
def list_documents():
    documents = []

    for filename, inverted_index in document_indexes.items():
        file_path = os.path.join(
            app.config["UPLOAD_FOLDER"],
            filename
        )
        if not os.path.exists(file_path):
            continue

        document = {
            "filename": filename,
            "unique_words": len(inverted_index),
            "file_exists": os.path.exists(file_path)
        }

        if os.path.exists(file_path):
            document["size_bytes"] = os.path.getsize(file_path)

        documents.append(document)

    documents.sort(
        key=lambda document: document["filename"].lower()
    )

    return jsonify({
        "total_documents": len(documents),
        "documents": documents
    })

@app.route("/documents/<path:filename>/view", methods=["GET"])
def view_document(filename):
    filename = secure_filename(filename)

    if filename == "":
        return jsonify({
            "error": "Invalid filename"
        }), 400

    file_path = os.path.join(
        app.config["UPLOAD_FOLDER"],
        filename
    )

    if not os.path.exists(file_path):
        return jsonify({
            "error": "Document not found"
        }), 404

    return send_from_directory(
        app.config["UPLOAD_FOLDER"],
        filename,
        mimetype="application/pdf"
    )

@app.route("/documents/<filename>", methods=["DELETE"])
def delete_document(filename):
    filename = secure_filename(filename)

    if filename == "":
        return jsonify({
            "error": "Invalid filename"
        }), 400

    file_path = os.path.join(
        app.config["UPLOAD_FOLDER"],
        filename
    )

    index_path = os.path.join(
        INDEX_FOLDER,
        filename + ".json"
    )

    if (
        filename not in document_indexes
        and not os.path.exists(file_path)
        and not os.path.exists(index_path)
    ):
        return jsonify({
            "error": "Document not found",
            "filename": filename
        }), 404

    try:
        if os.path.exists(file_path):
            os.remove(file_path)

        if os.path.exists(index_path):
            os.remove(index_path)

        document_indexes.pop(filename, None)
        document_position_pages.pop(filename, None)

        return jsonify({
            "message": "Document deleted successfully",
            "filename": filename
        }), 200

    except OSError:
        return jsonify({
            "error": "Failed to delete document"
        }), 500
    

if __name__ == "__main__":
    load_saved_indexes()
    app.run(debug=True)