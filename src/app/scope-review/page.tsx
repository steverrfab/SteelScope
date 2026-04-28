import { SectionPage } from "@/components/section-page";
import { StatusBadge } from "@/components/status-badge";

export default function ScopeReviewPage() {
  return (
    <SectionPage eyebrow="Scope Review" title="Included work, risks, RFIs, and clarifications">
      <section className="grid grid-3">
        <div className="card"><h3>Clearly included</h3><p>Structural beams, columns, bracing, base plates, and anchor rods.</p></div>
        <div className="card"><h3>Potentially included</h3><p>Architectural rails, loose lintels, civil bollards, and MEP dunnage.</p></div>
        <div className="card"><h3>Risk flags</h3><StatusBadge tone="review">Delegated design</StatusBadge></div>
      </section>
    </SectionPage>
  );
}
