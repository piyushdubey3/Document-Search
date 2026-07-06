import { useEffect, useState } from "react";
import { FaFilePdf, FaTrashCan} from "react-icons/fa6";

const API_URL = "http://127.0.0.1:5000";

function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchDocuments = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/documents`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to fetch documents"
        );
      }

      setDocuments(data.documents || []);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };


  const handleDelete = async (filename) => {
    const shouldDelete = window.confirm(
      `Delete "${filename}"?`
    );

    if (!shouldDelete) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/documents/${encodeURIComponent(
          filename
        )}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to delete document"
        );
      }

      setDocuments((currentDocuments) =>
        currentDocuments.filter(
          (document) => document.filename !== filename
        )
      );
    } catch (error) {
      setMessage(error.message);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return (
    <div className="documents-page">
      <div className="documents-page-header">
        <div>
          <span className="page-label">
            DOCUMENT LIBRARY
          </span>

          <h1>Your Documents</h1>

          <p>
            View and manage all PDFs in your searchable
            document collection.
          </p>
        </div>

        <div className="documents-count">
          {documents.length}
          <span>
            {documents.length === 1
              ? " document"
              : " documents"}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="documents-status">
          Loading documents...
        </div>
      ) : message ? (
        <div className="documents-status error">
          {message}
        </div>
      ) : documents.length === 0 ? (
        <div className="documents-empty">
          <FaFilePdf className="empty-pdf-icon" />

          <h2>No documents yet</h2>

          <p>
            Upload PDF files to start building your
            searchable document library.
          </p>
        </div>
      ) : (
        <div className="documents-grid">
          {documents.map((document) => (
            <a
              className="document-card"
              key={document.filename}
              href={`${API_URL}/documents/${encodeURIComponent(
                document.filename
              )}/view`}
              target="_blank"
              rel="noopener noreferrer"
>
              <div className="document-card-top">
                <span className="document-type">
                  PDF
                </span>

                <button
                  type="button"
                  className="delete-document-button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    handleDelete(document.filename);
                  }}
                  aria-label={`Delete ${document.filename}`}
                  title="Delete document"
                >
                  <FaTrashCan />
                </button>
              </div>

              <div className="document-card-content">
                <h3 title={document.filename}>
                  {document.filename}
                </h3>

                <p>
                  {document.unique_words} unique words
                  {document.size_bytes !== undefined && (
                    <>
                      <span> · </span>
                      {(document.size_bytes / 1024).toFixed(1)} KB
                    </>
                  )}
                </p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default Documents;