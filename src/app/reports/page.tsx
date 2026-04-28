import { SectionPage } from "@/components/section-page";

export default function ReportsPage() {
  return (
    <SectionPage eyebrow="Reports" title="Exports and bid deliverables">
      <section className="grid grid-3">
        {["Detailed Takeoff Excel", "Estimate Summary PDF", "Bid Proposal PDF", "Scope Review", "RFI List", "Addenda Impact"].map((report) => (
          <div className="card" key={report}><h3>{report}</h3><p>Queued through the report generation worker.</p></div>
        ))}
      </section>
    </SectionPage>
  );
}
