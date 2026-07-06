import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:5000";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const fetchDocuments = async () => {
    try {
      const response = await fetch(`${API_URL}/documents`);

      if (!response.ok) {
        throw new Error("Failed to fetch documents");
      }

      const data = await response.json();
      setDocuments(data.documents);
    } catch (error) {
      setMessage(error.message);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage("Please select a PDF file");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setMessage(data.message);
      setSelectedFile(null);
      await fetchDocuments();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };
  const handleSearch = async () => {
    const cleanedQuery = searchQuery.trim();

    if (!cleanedQuery) {
      setMessage("Please enter a search query");
      return;
    }

    setSearching(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/search?q=${encodeURIComponent(cleanedQuery)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Search failed");
      }

      setSearchResults(data.results);
    } catch (error) {
      setSearchResults([]);
      setMessage(error.message);
    } finally {
      setSearching(false);
    }
  };

  return (
    <main className="app">
      <h1>Document Search Engine</h1>

      <section className="card">
        <h2>Upload PDF</h2>

        <input
          type="file"
          accept=".pdf,application/pdf"
          onChange={(event) =>
            setSelectedFile(event.target.files[0] || null)
          }
        />

        <button onClick={handleUpload} disabled={loading}>
          {loading ? "Uploading..." : "Upload"}
        </button>

        {message && <p className="message">{message}</p>}
      </section>
      <section className="card">
        <h2>Search Documents</h2>

        <div className="search-row">
          <input
            type="text"
            value={searchQuery}
            placeholder="Search for words..."
            onChange={(event) => setSearchQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleSearch();
              }
            }}
          />

          <button
            onClick={handleSearch}
            disabled={searching}
          >
            {searching ? "Searching..." : "Search"}
          </button>
        </div>

        {searchResults.length > 0 && (
          <div className="search-results">
            {searchResults.map((result) => (
              <div
                className="search-result"
                key={result.filename}
              >
                <strong>{result.filename}</strong>

                <span>
                  Match: {result.match_percentage}%
                </span>

                <span>
                  Total occurrences: {result.total_occurrences}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card">
        <h2>Documents ({documents.length})</h2>

        {documents.length === 0 ? (
          <p>No documents uploaded yet.</p>
        ) : (
          <ul>
            {documents.map((document) => (
              <li key={document.filename}>
                <strong>{document.filename}</strong>
                <span>
                  {document.unique_words} unique words
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

export default App;