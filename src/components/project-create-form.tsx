"use client";

import Link from "next/link";
import { useState } from "react";

export function ProjectCreateForm() {
  const [status, setStatus] = useState<string>("");
  const [createdProjectId, setCreatedProjectId] = useState<string>("");

  async function submit(formData: FormData) {
    setStatus("Creating project...");
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        generalContractor: formData.get("generalContractor") || undefined,
        clientName: formData.get("clientName") || undefined,
        bidDate: formData.get("bidDate") || undefined
      })
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unable to create project." }));
      setStatus(error.error ?? "Unable to create project.");
      return;
    }
    const project = await response.json();
    setCreatedProjectId(project.id);
    setStatus(`Created ${project.name}. You can upload files using project ID ${project.id}.`);
  }

  return (
    <form action={submit} className="grid">
      <input name="name" required placeholder="Project name" style={{ padding: 12 }} />
      <input name="generalContractor" placeholder="General contractor" style={{ padding: 12 }} />
      <input name="clientName" placeholder="Client / owner" style={{ padding: 12 }} />
      <input name="bidDate" type="date" style={{ padding: 12 }} />
      <button className="button" type="submit">Create</button>
      {status ? <p>{status}</p> : null}
      {createdProjectId ? (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link className="button secondary" href="/projects">View projects</Link>
          <Link className="button" href="/upload-center">Upload bid package</Link>
        </div>
      ) : null}
    </form>
  );
}
