"use client";

import { useState } from "react";

interface SearchResult {
  type: string;
  id: string;
  title: string;
  snippet: string;
  pageNumber?: number;
  confidence?: number;
}

export function ProjectSearchPanel() {
  const [projectId, setProjectId] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [status, setStatus] = useState("");

  async function search() {
    if (!projectId || !query) return;
    setStatus("Searching...");
    const response = await fetch(`/api/projects/${projectId}/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Search failed." }));
      setStatus(error.error ?? "Search failed.");
      return;
    }
    const payload = await response.json();
    setResults(payload.results ?? []);
    setStatus(`${payload.results?.length ?? 0} result(s)`);
  }

  return (
    <section className="panel">
      <div className="grid">
        <input value={projectId} onChange={(event) => setProjectId(event.target.value)} placeholder="Project ID" style={{ padding: 12, border: "1px solid var(--line)", borderRadius: 6 }} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try beam, stair, galvanized, field verify, AESS, bollard" style={{ padding: 12, border: "1px solid var(--line)", borderRadius: 6 }} />
        <button className="button" onClick={search}>Search</button>
        {status ? <p>{status}</p> : null}
      </div>
      {results.length ? (
        <table>
          <thead><tr><th>Type</th><th>Title</th><th>Page</th><th>Snippet</th></tr></thead>
          <tbody>
            {results.map((result) => (
              <tr key={result.id}>
                <td>{result.type}</td>
                <td>{result.title}</td>
                <td>{result.pageNumber ?? ""}</td>
                <td>{result.snippet}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </section>
  );
}
