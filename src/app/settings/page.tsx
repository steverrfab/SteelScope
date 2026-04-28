import { SectionPage } from "@/components/section-page";

export default function SettingsPage() {
  return (
    <SectionPage eyebrow="Settings" title="Security, providers, and organization controls">
      <section className="grid grid-2">
        <div className="card"><h3>Access control</h3><p>Organization roles, permissions, audit logs, and approval authority.</p></div>
        <div className="card"><h3>Provider configuration</h3><p>S3-compatible storage, Redis queue, OCR, LLM, embeddings, and report generation.</p></div>
      </section>
    </SectionPage>
  );
}
