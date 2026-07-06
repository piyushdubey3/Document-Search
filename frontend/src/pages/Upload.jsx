import { useState } from "react";
import { Link } from "react-router-dom";
const API_URL = "http://127.0.0.1:5000";

function Upload() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [message, setMessage] = useState("");
  const [uploadResults , setUploadResults]= useState([]);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setMessage("Please select at least one PDF file");
      return;
    }

    const formData = new FormData();

    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });

    setLoading(true);
    setMessage("");
    setUploadResults([]);

    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setMessage(
        `${data.successful_uploads} uploaded, ` +
        `${data.failed_uploads} failed`
      );
      setUploadResults(data.results || []);

      setSelectedFiles([]);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const removeFile = (indexToRemove) => {
    setSelectedFiles((currentFiles) =>
      currentFiles.filter(
        (_, index) => index !== indexToRemove
      )
    );

    setMessage("");
  };

  return (
    <div className="upload-page">
      <div className="upload-page-header">
        <div>
          <h1>Upload Documents</h1>

          <p>
            Add PDFs to your workspace and make them
            ready to search.
          </p>
        </div>
      </div>

      <section className="upload-workspace">
        <div className="upload-zone">
          <div className="upload-illustration">
            <div className="upload-arrow">↑</div>
            <div className="upload-file-shape"></div>
          </div>

          <h2>Bring your documents here</h2>

          <p>
            Choose one or more PDFs from your computer
            to add them to your searchable library.
          </p>

          <label className="file-picker">
            <span>Choose PDFs</span>

            <input
              type="file"
              accept=".pdf,application/pdf"
              multiple
              onChange={(event) => {
                const files = Array.from(
                  event.target.files
                );

                setSelectedFiles(files);
                setMessage("");
              }}
            />
          </label>

          <span className="upload-hint">
            PDF format only · Multiple files supported
          </span>
        </div>

        <div className="upload-side-panel">
          <div className="side-panel-heading">
            <span>
              Selected documents
              {selectedFiles.length > 0 &&
                ` (${selectedFiles.length})`}
            </span>
          </div>

          {selectedFiles.length > 0 ? (
            <div className="selected-files-list">
              {selectedFiles.map((file, index) => (
                <div
                  className="selected-file-card"
                  key={`${file.name}-${index}`}
                >
                  <div className="large-pdf-icon">
                    <span>PDF</span>
                  </div>

                  <div className="selected-file-details">
                    <strong>{file.name}</strong>

                    <span>
                      {(file.size / 1024).toFixed(1)} KB
                    </span>

                    <div className="file-ready">
                      <span className="ready-dot"></span>
                      Ready to upload
                    </div>
                  </div>

                  <button
                    type="button"
                    className="remove-file-button"
                    onClick={() => removeFile(index)}
                    aria-label={`Remove ${file.name}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-selection">
              <div className="empty-file-icon">▤</div>

              <p>No documents selected yet</p>

              <span>
                Your chosen files will appear here.
              </span>
            </div>
          )}

          <button
            className="upload-button"
            onClick={handleUpload}
            disabled={
              loading || selectedFiles.length === 0
            }
          >
            {loading ? (
              "Uploading documents..."
            ) : (
              <>
                Upload All Documents
                <span>→</span>
              </>
            )}
          </button>

          {message && (
            <div className="upload-message">
              {message}
            </div>
          )}
          {uploadResults.length > 0 && (
            <div className="upload-results-list">
              {uploadResults.map((result, index) => (
                <div
                  className={`upload-result-item ${result.status}`}
                  key={`${result.filename || index}-${index}`}
                >
                  <div className="upload-result-icon">
                    {result.status === "success" ? "✓" : "×"}
                  </div>

                  <div className="upload-result-details">
                    <strong>
                      {result.filename ||
                        result.original_filename ||
                        "Unknown file"}
                    </strong>

                    <span>
                      {result.status === "success"
                        ? "Uploaded successfully"
                        : result.error || "Upload failed"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="upload-documents-link">
        <span>Already added your files?</span>

        <Link 
          to="/documents"
          className="view-documents-button"
        >
          View Documents →
        </Link>
      </div>
    </div>
  );
}

export default Upload;