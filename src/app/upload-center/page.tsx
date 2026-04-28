import { SectionPage } from "@/components/section-page";
import { StatusBadge } from "@/components/status-badge";
import { ChunkedUploadPanel } from "@/components/chunked-upload-panel";

export default function UploadCenterPage() {
  return (
    <SectionPage eyebrow="Upload Center" title="Large bid package intake">
      <div className="grid grid-2">
        <section className="panel">
          <h2>Resumable upload queue</h2>
          <p>Multipart upload contracts support PDFs, plans, specs, Excel, CSV, Word docs, addenda, bid forms, and scope sheets.</p>
          <ChunkedUploadPanel />
        </section>
        <section className="panel">
          <h2>Processing stages</h2>
          <table>
            <tbody>
              <tr><td>Split PDFs into pages</td><td><StatusBadge>Ready</StatusBadge></td></tr>
              <tr><td>OCR/vector text/tables</td><td><StatusBadge tone="review">Provider required</StatusBadge></td></tr>
              <tr><td>Classify sheets and extract scope</td><td><StatusBadge tone="review">Provider required</StatusBadge></td></tr>
            </tbody>
          </table>
        </section>
      </div>
    </SectionPage>
  );
}
