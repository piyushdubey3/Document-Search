
# Document Search Engine

A full-stack document search application for uploading, searching, viewing, and managing PDF documents.

The system builds positional indexes from uploaded PDFs and supports both word-based search and exact phrase search. Search results can be opened directly inside an integrated PDF viewer with highlighted matches and circular Previous/Next navigation.

## Features

- Upload PDF documents
- Extract and process PDF text
- Build positional inverted indexes
- Persist generated indexes
- Search across multiple documents
- Word-based search
- Exact phrase search
- Display matched documents and occurrences
- Open search results in an integrated PDF viewer
- Highlight matching text inside PDFs
- View uploaded document collection
- Delete documents and associated indexes
- Responsive React-based interface

## Tech Stack

### Frontend

- React
- Vite
- React Router
- React PDF
- React Icons
- CSS

### Backend

- Python
- Flask
- Flask-CORS
- PyPDF

## Search Architecture

The application processes uploaded PDF documents and builds a positional inverted index.

For each indexed term, the system stores positional information that can be used for:

- locating word occurrences
- identifying matched pages
- exact phrase matching
- navigating between search occurrences

Generated indexes are persisted locally so documents do not need to be fully re-indexed every time the backend restarts.

## Project Structure

```text
Document Search Engine/
├── backend/
│   ├── app.py
│   ├── document_processor.py
│   ├── indexer.py
│   ├── uploads/
│   └── indexes/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── css/
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

The `uploads/` and `indexes/` directories contain runtime-generated data and are excluded from version control.

## Running the Project Locally

### 1. Clone the repository

```bash
git clone <repository-url>
cd <repository-folder>
```

### 2. Start the backend

Navigate to the backend directory:

```bash
cd backend
```

Install the required Python dependencies:

```bash
pip install flask flask-cors pypdf
```

Run the Flask server:

```bash
python app.py
```

The backend runs at:

```text
http://127.0.0.1:5000
```

### 3. Start the frontend

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

Open the local URL displayed by Vite in the terminal.

## Search Modes

### Words

Searches indexed words across the document collection and returns matching occurrences.

### Exact Phrase

Uses positional information to find consecutive terms occurring in the requested order.

## Current Status

This project currently includes the core document retrieval workflow:

- PDF ingestion
- text extraction
- positional indexing
- persistent local indexes
- document search
- exact phrase search
- document management
- integrated PDF viewing
- highlighted match navigation

Further improvements are planned.

## Future Improvements

- Improve search result ranking
- Add fuzzy search for minor spelling mistakes
- Support scanned PDFs using OCR
- Show better context around search matches
- Add user accounts and personal document collections
and much more..........

## Author

Piyush Dubey  
B.Tech Data Science and Engineering  
IIT Palakkad
>>>>>>> origin/main
