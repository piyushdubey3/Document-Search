import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaMagnifyingGlass,
  FaFilePdf,
} from "react-icons/fa6";

const API_URL = "http://127.0.0.1:5000";

function Search() {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [searchMode, setSearchMode] = useState("words");
  const [results, setResults] = useState([]);
  const [searchedQuery, setSearchedQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (event) => {
    event.preventDefault();

    const cleanQuery = query.trim();

    if (!cleanQuery) {
      setMessage("Enter something to search");
      return;
    }

    if (
      searchMode === "phrase" &&
      cleanQuery.split(/\s+/).length < 2
    ) {
      setMessage(
        "Exact phrase search requires at least two words"
      );
      return;
    }

    setLoading(true);
    setMessage("");
    setHasSearched(true);

    try {
      const endpoint =
        searchMode === "phrase"
          ? "/phrase-search"
          : "/search";

      const response = await fetch(
        `${API_URL}${endpoint}?q=${encodeURIComponent(
          cleanQuery
        )}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Search failed"
        );
      }

      setResults(data.results || []);
      setSearchedQuery(cleanQuery);
    } catch (error) {
      setResults([]);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getOccurrenceCount = (result) => {
    if (searchMode === "phrase") {
      return result.count || 0;
    }

    return result.total_occurrences || 0;
  };

  const getMatchPercentage = (result) => {
    if (searchMode === "phrase") {
      return 100;
    }

    return result.match_percentage || 0;
  };

  const handleOpenMatch = (result) => {
    const occurrences =
      result.match_occurrences || [];

    if (occurrences.length === 0) {
      setMessage(
        "No page information is available for this match"
      );
      return;
    }

    navigate(
      `/viewer/${encodeURIComponent(
        result.filename
      )}`,
      {
        state: {
          query: searchedQuery,
          searchMode,
          matchOccurrences: occurrences,
          currentMatchIndex: 0,
        },
      }
    );
  };

  const handleOpenPdf = (filename) => {
    window.open(
      `${API_URL}/documents/${encodeURIComponent(
        filename
      )}/view`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="search-page">
      <div className="search-page-header">
        <span className="page-label">
          SEARCH DOCUMENTS
        </span>

        <h1>Find anything across your PDFs</h1>

        <p>
          Search words or exact phrases across your
          document collection.
        </p>
      </div>

      <div className="search-mode-switch">
        <button
          type="button"
          className={
            searchMode === "words" ? "active" : ""
          }
          onClick={() => {
            setSearchMode("words");
            setMessage("");
          }}
        >
          Words
        </button>

        <button
          type="button"
          className={
            searchMode === "phrase" ? "active" : ""
          }
          onClick={() => {
            setSearchMode("phrase");
            setMessage("");
          }}
        >
          Exact Phrase
        </button>
      </div>

      <form
        className="google-search-form"
        onSubmit={handleSearch}
      >
        <FaMagnifyingGlass className="google-search-icon" />

        <input
          type="text"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setMessage("");
          }}
          placeholder={
            searchMode === "phrase"
              ? "Search an exact phrase..."
              : "Search your documents..."
          }
        />

        <button
          type="submit"
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {message && (
        <div className="search-status error">
          {message}
        </div>
      )}

      {!loading &&
        !message &&
        hasSearched &&
        results.length === 0 && (
          <div className="search-empty-state">
            <FaMagnifyingGlass />

            <h2>No matching documents found</h2>

            <p>
              Try another search term or switch the
              search mode.
            </p>
          </div>
        )}

      {!loading && results.length > 0 && (
        <section className="search-results-section">
          <div className="search-results-heading">
            <div>
              <h2>Search Results</h2>

              <p>
                {results.length}{" "}
                {results.length === 1
                  ? "document"
                  : "documents"}{" "}
                found for "{searchedQuery}"
              </p>
            </div>
          </div>

          <div className="search-results-list">
            {results.map((result) => {
              const pages = result.pages || [];
              const occurrenceCount =
                getOccurrenceCount(result);

              const matchPercentage =
                getMatchPercentage(result);

              return (
                <article
                  className="search-result-card"
                  key={result.filename}
                >
                  <div className="search-result-icon">
                    <FaFilePdf />
                  </div>

                  <div className="search-result-main">
                    <div className="search-result-title-row">
                      <div>
                        <h3>{result.filename}</h3>

                        <p>
                          {occurrenceCount}{" "}
                          {occurrenceCount === 1
                            ? "occurrence"
                            : "occurrences"}
                        </p>
                      </div>

                      <div className="result-match-badge">
                        {matchPercentage}% match
                      </div>
                    </div>

                    <div className="result-pages">
                      {pages.length > 0 ? (
                        <>
                          Found on{" "}
                          {pages.length === 1
                            ? "page "
                            : "pages "}
                          {pages.join(", ")}
                        </>
                      ) : (
                        "Page information unavailable"
                      )}
                    </div>

                    <div className="search-result-actions">
                      <button
                        type="button"
                        className="open-match-button"
                        onClick={() =>
                          handleOpenMatch(result)
                        }
                      >
                        View Matches
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

export default Search;