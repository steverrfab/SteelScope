"use client";

import { useState } from "react";

interface UploadRow {
  name: string;
  progress: number;
  status: string;
}

export function ChunkedUploadPanel() {
  const [projectId, setProjectId] = useState("");
  const [rows, setRows] = useState<UploadRow[]>([]);

  async function uploadFiles(files: FileList | null) {
    if (!files || !projectId.trim()) return;
    for (const file of Array.from(files)) {
      await uploadFile(file);
    }
  }

  async function uploadFile(file: File) {
    setRow(file.name, 0, "Initiating");
    const initiate = await fetch(`/api/projects/${projectId}/uploads/initiate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type || contentTypeFromName(file.name),
        sizeBytes: file.size
      })
    });

    if (!initiate.ok) {
      const error = await initiate.json().catch(() => ({ error: "Upload initiate failed." }));
      setRow(file.name, 0, error.error ?? "Upload initiate failed");
      return;
    }

    const upload = await initiate.json();
    const parts: Array<{ partNumber: number; checksum: string; etag: string; sizeBytes: number }> = [];
    const chunkSize = upload.chunkSizeBytes as number;
    const totalParts = Math.ceil(file.size / chunkSize);

    for (let index = 0; index < totalParts; index += 1) {
      const partNumber = index + 1;
      const start = index * chunkSize;
      const chunk = file.slice(start, Math.min(start + chunkSize, file.size));
      const response = await fetch(`/api/projects/${projectId}/uploads/${upload.uploadId}/chunks/${partNumber}`, {
        method: "PUT",
        headers: {
          "content-type": "application/octet-stream",
          "x-object-key": upload.objectKey
        },
        body: chunk
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: `Part ${partNumber} failed.` }));
        setRow(file.name, Math.round((index / totalParts) * 100), error.error ?? `Part ${partNumber} failed`);
        return;
      }
      parts.push(await response.json());
      setRow(file.name, Math.round((partNumber / totalParts) * 90), `Uploaded part ${partNumber}/${totalParts}`);
    }

    const complete = await fetch(`/api/projects/${projectId}/uploads/${upload.uploadId}/complete`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        fileId: upload.fileId,
        objectKey: upload.objectKey,
        parts
      })
    });

    if (!complete.ok) {
      const error = await complete.json().catch(() => ({ error: "Upload complete failed." }));
      setRow(file.name, 90, error.error ?? "Upload complete failed");
      return;
    }

    setRow(file.name, 95, "Processing PDF");
    const process = await fetch(`/api/projects/${projectId}/process-file/${upload.fileId}`, {
      method: "POST"
    });
    if (!process.ok) {
      const error = await process.json().catch(() => ({ error: "Upload queued, but processing did not start." }));
      setRow(file.name, 95, error.error ?? "Upload queued, but processing did not start");
      return;
    }

    setRow(file.name, 100, "Processed and searchable");
  }

  function setRow(name: string, progress: number, status: string) {
    setRows((current) => {
      const existing = current.find((row) => row.name === name);
      if (!existing) return [...current, { name, progress, status }];
      return current.map((row) => (row.name === name ? { name, progress, status } : row));
    });
  }

  return (
    <div className="grid">
      <input
        value={projectId}
        onChange={(event) => setProjectId(event.target.value)}
        placeholder="Project ID"
        style={{ padding: 12, border: "1px solid var(--line)", borderRadius: 6 }}
      />
      <input
        type="file"
        multiple
        accept=".pdf,.xlsx,.xls,.csv,.docx,.doc"
        onChange={(event) => uploadFiles(event.target.files)}
      />
      {rows.length ? (
        <table>
          <thead>
            <tr><th>File</th><th>Progress</th><th>Status</th></tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name}>
                <td>{row.name}</td>
                <td>{row.progress}%</td>
                <td>{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </div>
  );
}

function contentTypeFromName(name: string) {
  const lower = name.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".xlsx")) return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  if (lower.endsWith(".xls")) return "application/vnd.ms-excel";
  if (lower.endsWith(".csv")) return "text/csv";
  if (lower.endsWith(".docx")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (lower.endsWith(".doc")) return "application/msword";
  return "application/octet-stream";
}
