"use client";

import { useMemo, useState } from "react";
import type { TranslationDocument } from "../data/translationCatalog";

const pageSize = 12;

type Props = {
  documents: TranslationDocument[];
};

export default function TranslationLibrary({ documents }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All documents");
  const [visibleLimit, setVisibleLimit] = useState(pageSize);

  const categories = useMemo(
    () => ["All documents", ...Array.from(new Set(documents.map((document) => document.category)))],
    [documents],
  );

  const visibleDocuments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return documents.filter((document) => {
      const matchesCategory = category === "All documents" || document.category === category;
      const haystack = [
        document.title,
        document.subtitle,
        document.description,
        document.sourceLanguage,
        document.language,
        document.year,
        document.status,
        ...document.searchTerms,
      ]
        .join(" ")
        .toLowerCase();

      return matchesCategory && (!normalizedQuery || haystack.includes(normalizedQuery));
    });
  }, [category, documents, query]);

  const renderedDocuments = visibleDocuments.slice(0, visibleLimit);

  return (
    <div className="translation-library">
      <div className="translation-toolbar" aria-label="Translation library filters">
        <label className="translation-search">
          <span>SEARCH THE ARCHIVE</span>
          <span className="translation-search-field">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setVisibleLimit(pageSize);
              }}
              placeholder="Title, system, topic…"
              autoComplete="off"
            />
          </span>
        </label>

        <label className="translation-filter">
          <span>DOCUMENT TYPE</span>
          <select
            value={category}
            onChange={(event) => {
              setCategory(event.target.value);
              setVisibleLimit(pageSize);
            }}
          >
            {categories.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <div className="translation-count" aria-live="polite">
          <strong>{String(visibleDocuments.length).padStart(2, "0")}</strong>
          <span>{visibleDocuments.length === 1 ? "DOCUMENT" : "DOCUMENTS"}</span>
        </div>
      </div>

      {visibleDocuments.length ? (
        <div className="translation-grid">
          {renderedDocuments.map((document, index) => (
            <article className="translation-card" key={document.id} data-burst>
              <div className="translation-card-index" aria-hidden="true">
                {String(index + 1).padStart(3, "0")}
              </div>

              <div className="translation-document-mark" aria-hidden="true">
                <span>PDF</span>
                <i />
                <i />
                <i />
                <b>EN</b>
              </div>

              <div className="translation-card-copy">
                <div className="translation-card-topline">
                  <span>{document.category}</span>
                  <span>{document.status}</span>
                </div>
                <h3>{document.title}</h3>
                <p className="translation-subtitle">{document.subtitle}</p>
                <p className="translation-description">{document.description}</p>

                <dl className="translation-metadata">
                  <div>
                    <dt>SOURCE</dt>
                    <dd>{document.sourceLanguage}</dd>
                  </div>
                  <div>
                    <dt>YEAR</dt>
                    <dd>{document.year}</dd>
                  </div>
                  <div>
                    <dt>LENGTH</dt>
                    <dd>{document.sourcePages} source pages</dd>
                  </div>
                  <div>
                    <dt>FILE</dt>
                    <dd>{document.fileSize}</dd>
                  </div>
                </dl>

                <p className="translation-credits">{document.credits}</p>

                <div className="translation-actions">
                  <a
                    className="translation-read"
                    href={document.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    data-cuelume-hover="chime"
                    data-cuelume-press="press"
                    data-cuelume-release="release"
                  >
                    Read in browser <span aria-hidden="true">↗</span>
                  </a>
                  <a
                    className="translation-download"
                    href={document.fileUrl}
                    download
                    data-cuelume-hover="tick"
                  >
                    Download PDF <span aria-hidden="true">↓</span>
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="translation-empty">
          <span aria-hidden="true">⌕</span>
          <strong>No documents match that search.</strong>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setCategory("All documents");
              setVisibleLimit(pageSize);
            }}
          >
            Clear the filters
          </button>
        </div>
      )}

      {visibleDocuments.length > renderedDocuments.length ? (
        <div className="translation-load-more">
          <span>
            Showing {renderedDocuments.length} of {visibleDocuments.length}
          </span>
          <button
            type="button"
            onClick={() => setVisibleLimit((limit) => limit + pageSize)}
          >
            Load {Math.min(pageSize, visibleDocuments.length - renderedDocuments.length)} more
            <span aria-hidden="true">↓</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
