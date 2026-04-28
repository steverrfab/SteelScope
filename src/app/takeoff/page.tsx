import { SectionPage } from "@/components/section-page";
import { StatusBadge } from "@/components/status-badge";

export default function TakeoffPage() {
  return (
    <SectionPage eyebrow="Takeoff" title="Reviewable steel takeoff">
      <section className="panel">
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Shape</th>
              <th>Qty</th>
              <th>Length</th>
              <th>Weight</th>
              <th>Source</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Roof frame beam</td>
              <td>W12x26</td>
              <td>4</td>
              <td>18 ft</td>
              <td>1,872 lb</td>
              <td>S203 / 4</td>
              <td><StatusBadge tone="review">Needs review</StatusBadge></td>
            </tr>
          </tbody>
        </table>
      </section>
    </SectionPage>
  );
}
