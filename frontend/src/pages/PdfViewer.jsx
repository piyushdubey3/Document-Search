import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useLocation,
  useParams,
} from "react-router-dom";

import {
  Document,
  Page,
  pdfjs,
} from "react-pdf";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const API_URL = "http://127.0.0.1:5000";

function PdfViewer() {
  const { filename } = useParams();
  const location = useLocation();

  const [numPages, setNumPages] =
    useState(null);

  const [currentMatchIndex, setCurrentMatchIndex] =
    useState(
      location.state?.currentMatchIndex ?? 0
    );

  const pageRefs = useRef({});

  const query =
    location.state?.query?.trim() || "";

  const searchMode =
    location.state?.searchMode || "words";

  const matchOccurrences = useMemo(() => {
    return (
      location.state?.matchOccurrences || []
    );
  }, [location.state]);

  const currentMatch =
    matchOccurrences[currentMatchIndex] || null;

  const pdfUrl =
    `${API_URL}/documents/${encodeURIComponent(
      filename
    )}/view`;

  const escapeRegExp = (text) => {
    return text.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );
  };

  const escapeHtml = (text) => {
    return text
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  };

  /*
    Build search terms.

    Words mode:
    "computer network lab"
    becomes:
    ["computer", "network", "lab"]

    Phrase mode:
    "computer network"
    stays one complete phrase.
  */
  const searchTerms = useMemo(() => {
    if (!query) {
      return [];
    }

    if (searchMode === "phrase") {
      return [query];
    }

    return (
      query
        .toLowerCase()
        .match(/[a-z0-9]+/g) || []
    );
  }, [query, searchMode]);

  /*
    Highlight ALL visible matches.

    React-PDF expects an HTML string from
    customTextRenderer.
  */
  const customTextRenderer = ({
    str,
  }) => {
    if (
      !str ||
      searchTerms.length === 0
    ) {
      return escapeHtml(str || "");
    }

    const sortedTerms = [
      ...searchTerms,
    ].sort(
      (firstTerm, secondTerm) =>
        secondTerm.length -
        firstTerm.length
    );

    const pattern = sortedTerms
      .map(escapeRegExp)
      .join("|");

    if (!pattern) {
      return escapeHtml(str);
    }

    const regex = new RegExp(
      `(${pattern})`,
      "gi"
    );

    const parts = str.split(regex);

    return parts
      .map((part) => {
        const isMatch =
          sortedTerms.some(
            (term) =>
              part.toLowerCase() ===
              term.toLowerCase()
          );

        if (!isMatch) {
          return escapeHtml(part);
        }

        return (
          '<mark class="pdf-search-highlight">' +
          escapeHtml(part) +
          "</mark>"
        );
      })
      .join("");
  };

  /*
    Find which backend match number this is
    on the current page.

    Example:
    If Match 7 is the third match on page 4,
    this returns 2.

    That lets us select the third yellow mark
    on page 4 and turn it orange.
  */
  const getMatchIndexOnCurrentPage = () => {
    if (!currentMatch?.page) {
      return 0;
    }

    let indexOnPage = 0;

    for (
      let index = 0;
      index < currentMatchIndex;
      index += 1
    ) {
      if (
        matchOccurrences[index]?.page ===
        currentMatch.page
      ) {
        indexOnPage += 1;
      }
    }

    return indexOnPage;
  };

  /*
    Whenever current match changes:

    1. remove old orange highlight
    2. locate current page
    3. locate exact mark on that page
    4. make it orange
    5. scroll exactly once to it

    The retry exists only because React-PDF may still
    be building the text layer.

    Once found, retrying stops completely.
    Therefore manual scrolling remains free.
  */
  useEffect(() => {
    if (!currentMatch?.page) {
      return;
    }

    let cancelled = false;
    let attempts = 0;
    let timerId = null;

    const moveToCurrentMatch = () => {
      if (cancelled) {
        return;
      }

      document
        .querySelectorAll(
          ".pdf-search-highlight.current"
        )
        .forEach((element) => {
          element.classList.remove(
            "current"
          );
        });

      const pageElement =
        pageRefs.current[
          currentMatch.page
        ];

      if (!pageElement) {
        attempts += 1;

        if (attempts < 30) {
          timerId = window.setTimeout(
            moveToCurrentMatch,
            100
          );
        }

        return;
      }

      const pageHighlights =
        pageElement.querySelectorAll(
          ".pdf-search-highlight"
        );

      const indexOnPage =
        getMatchIndexOnCurrentPage();

      const targetHighlight =
        pageHighlights[indexOnPage];

      if (targetHighlight) {
        targetHighlight.classList.add(
          "current"
        );

        targetHighlight.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });

        return;
      }

      /*
        Text layer may not be ready yet.
        Retry temporarily, then stop.
      */
      attempts += 1;

      if (attempts < 30) {
        timerId = window.setTimeout(
          moveToCurrentMatch,
          100
        );

        return;
      }

      /*
        Fallback:
        if exact mark mapping fails,
        at least move to the correct page once.
      */
      pageElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    };

    timerId = window.setTimeout(
      moveToCurrentMatch,
      100
    );

    return () => {
      cancelled = true;

      if (timerId) {
        window.clearTimeout(timerId);
      }
    };
  }, [
    currentMatchIndex,
    currentMatch?.page,
  ]);

  const goToPreviousMatch = () => {
    if (matchOccurrences.length === 0) {
      return;
    }

    setCurrentMatchIndex(
      (currentIndex) => {
        if (currentIndex === 0) {
          return (
            matchOccurrences.length - 1
          );
        }

        return currentIndex - 1;
      }
    );
  };

  const goToNextMatch = () => {
    if (matchOccurrences.length === 0) {
      return;
    }

    setCurrentMatchIndex(
      (currentIndex) => {
        if (
          currentIndex ===
          matchOccurrences.length - 1
        ) {
          return 0;
        }

        return currentIndex + 1;
      }
    );
  };

  return (
    <div className="pdf-viewer-page">
      <div className="pdf-viewer-header">
        <h1>{filename}</h1>
      </div>

      {matchOccurrences.length > 0 && (
        <div className="match-navigation">
          <button
            type="button"
            onClick={goToPreviousMatch}
          >
            ← Previous
          </button>

          <span>
            Match{" "}
            {currentMatchIndex + 1} of{" "}
            {matchOccurrences.length}
          </span>

          <button
            type="button"
            onClick={goToNextMatch}
          >
            Next →
          </button>
        </div>
      )}

      <div className="pdf-document-container">
        <Document
          file={pdfUrl}
          onLoadSuccess={({
            numPages: loadedPages,
          }) => {
            setNumPages(loadedPages);
          }}
          loading={
            <div className="pdf-loading">
              Loading PDF...
            </div>
          }
          error={
            <div className="pdf-error">
              Failed to load PDF file
            </div>
          }
        >
          {Array.from(
            {
              length: numPages || 0,
            },
            (_, index) => {
              const pageNumber =
                index + 1;

              return (
                <div
                  key={
                    `page_wrapper_` +
                    pageNumber
                  }
                  ref={(element) => {
                    if (element) {
                      pageRefs.current[
                        pageNumber
                      ] = element;
                    } else {
                      delete (
                        pageRefs.current[
                          pageNumber
                        ]
                      );
                    }
                  }}
                  className="pdf-page-wrapper"
                >
                  <div className="pdf-page-number">
                    Page {pageNumber}
                  </div>

                  <Page
                    pageNumber={pageNumber}
                    renderTextLayer={true}
                    renderAnnotationLayer={
                      true
                    }
                    customTextRenderer={
                      customTextRenderer
                    }
                  />
                </div>
              );
            }
          )}
        </Document>
      </div>
    </div>
  );
}

export default PdfViewer;