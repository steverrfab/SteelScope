import { SectionPage } from "@/components/section-page";

export default function DocumentViewerPage() {
  return (
    <SectionPage eyebrow="Document Viewer" title="Plans, specs, addenda, and bid forms">
      <section className="viewer">
        <aside>{[1, 2, 3].map((page) => <div className="thumbnail" key={page}>Page {page}</div>)}</aside>
        <div className="canvas">Select a processed page to inspect text, tables, and citations</div>
        <aside className="panel">
          <h2>Page intelligence</h2>
          <p>Sheet number, title, scale, discipline, page type, OCR confidence, detected terms, and source text appear here.</p>
        </aside>
      </section>
    </SectionPage>
  );
}
