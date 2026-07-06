import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="hero-content">
          <h1>
            Find what you need,
            <span> when you need it.</span>
          </h1>

          <p>
            Upload your PDF documents and search across
            them from one simple place. Spend less time
            looking through files and more time finding
            the information that matters.
          </p>

          <div className="hero-actions">
            <Link to="/search" className="primary-action">
              Start Searching
            </Link>

            <Link to="/upload" className="secondary-action">
              Upload Documents
            </Link>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-visual-content">
            <div className="project-name">
              Document Search Engine
            </div>

            <div className="search-demo">
            <div className="demo-top">
              <span className="demo-dot"></span>
              <span className="demo-dot"></span>
              <span className="demo-dot"></span>
            </div>

            <div className="demo-search-bar">
              <span className="search-symbol">⌕</span>
              <span>Search your documents...</span>
            </div>

            <div className="demo-result">
              <div className="result-file-icon">
                PDF
              </div>

              <div className="result-content">
                <strong>Research Notes.pdf</strong>
                <span>
                  Found relevant information...
                </span>
              </div>

              <div className="result-match">
                92%
              </div>
            </div>

            <div className="demo-result">
              <div className="result-file-icon">
                PDF
              </div>

              <div className="result-content">
                <strong>Project Report.pdf</strong>
                <span>
                  Matching content found...
                </span>
              </div>

              <div className="result-match">
                84%
              </div>
            </div>

            <div className="floating-found">
              ✓ Results found
            </div>
          </div>
        </div>
        </div>
      </section>

      <section className="home-intro">
        <h2>
          A simpler way to work with your documents
        </h2>

        <p>
          Keep your PDFs together, search across them,
          and reach useful information without opening
          every file one by one.
        </p>
      </section>

      <section className="home-features">
        <Link
          to="/upload"
          className="feature-card feature-link"
        >
          <div className="feature-icon">↑</div>

          <h3>Upload Documents</h3>

          <p>
            Add your PDF files and keep them ready
            whenever you need to search.
          </p>

          <span className="feature-action">
            Add documents →
          </span>
        </Link>

        <Link
          to="/search"
          className="feature-card feature-link"
        >
          <div className="feature-icon">⌕</div>

          <h3>Search Instantly</h3>

          <p>
            Search across your documents from one place
            and quickly discover relevant results.
          </p>

          <span className="feature-action">
            Start searching →
          </span>
        </Link>

        <Link
          to="/documents"
          className="feature-card feature-link"
        >
          <div className="feature-icon">▤</div>

          <h3>View Your Library</h3>

          <p>
            See all your uploaded documents together
            in a clean and organized collection.
          </p>

          <span className="feature-action">
            View documents →
          </span>
        </Link>
      </section>
    </div>
  );
}

export default Home;