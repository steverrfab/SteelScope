import { SectionPage } from "@/components/section-page";

export default function AddendaPage() {
  return (
    <SectionPage eyebrow="Addenda" title="Revision and addenda impact">
      <section className="panel">
        <table>
          <thead><tr><th>Addendum</th><th>Changed sheets</th><th>Added lb</th><th>Removed lb</th><th>Net cost</th></tr></thead>
          <tbody><tr><td>Awaiting upload</td><td>0</td><td>0</td><td>0</td><td>$0</td></tr></tbody>
        </table>
      </section>
    </SectionPage>
  );
}
