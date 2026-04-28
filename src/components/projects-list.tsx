"use client";

import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/status-badge";

interface ProjectRow {
  id: string;
  name: string;
  generalContractor: string | null;
  bidDate: string | null;
  status: string;
  fileCount: number;
  pageCount: number;
  reviewFlagCount: number;
}

export function ProjectsList() {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [status, setStatus] = useState("Loading projects...");

  useEffect(() => {
    fetch("/api/projects")
      .then(async (response) => {
        if (!response.ok) throw new Error((await response.json()).error ?? "Unable to load projects.");
        return response.json();
      })
      .then((payload) => {
        setProjects(payload.projects ?? []);
        setStatus("");
      })
      .catch((error) => setStatus(error instanceof Error ? error.message : "Unable to load projects."));
  }, []);

  if (status) {
    return <section className="panel">{status}</section>;
  }

  if (!projects.length) {
    return (
      <section className="panel">
        <h2>No projects yet</h2>
        <p>Create a project, then upload a bid package from Upload Center.</p>
      </section>
    );
  }

  return (
    <section className="panel">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Project ID</th>
            <th>GC</th>
            <th>Bid date</th>
            <th>Status</th>
            <th>Files</th>
            <th>Pages</th>
            <th>Review</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.id}>
              <td>{project.name}</td>
              <td><code>{project.id}</code></td>
              <td>{project.generalContractor ?? ""}</td>
              <td>{project.bidDate ? project.bidDate.slice(0, 10) : ""}</td>
              <td><StatusBadge>{project.status}</StatusBadge></td>
              <td>{project.fileCount}</td>
              <td>{project.pageCount}</td>
              <td>
                {project.reviewFlagCount ? (
                  <StatusBadge tone="review">{project.reviewFlagCount} flags</StatusBadge>
                ) : (
                  <StatusBadge>Clear</StatusBadge>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
