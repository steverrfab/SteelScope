import { SectionPage } from "@/components/section-page";

export default function DrawingViewerPage() {
  return (
    <SectionPage eyebrow="Drawing Viewer" title="Source-linked drawing review">
      <section className="viewer">
        <aside>{["S101", "A401", "C203"].map((sheet) => <div className="thumbnail" key={sheet}>{sheet}</div>)}</aside>
        <div className="canvas">Pan, zoom, measurement, markups, AI overlays, and revision compare layer</div>
        <aside className="panel">
          <h2>Linked takeoff</h2>
          <p>Clicking approved or candidate items jumps between the sheet evidence and estimate line.</p>
        </aside>
      </section>
    </SectionPage>
  );
}
