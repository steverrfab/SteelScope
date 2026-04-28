import { seedSteelShapes } from "@/domain/steel-shapes";
import { SectionPage } from "@/components/section-page";

export default function PricingDatabasePage() {
  return (
    <SectionPage eyebrow="Pricing Database" title="Shapes, assemblies, and pricing templates">
      <section className="panel">
        <table>
          <thead><tr><th>Family</th><th>Size</th><th>Weight / ft</th><th>Source</th></tr></thead>
          <tbody>
            {seedSteelShapes.map((shape) => (
              <tr key={shape.id}><td>{shape.family}</td><td>{shape.size}</td><td>{shape.weightPerFoot}</td><td>{shape.source}</td></tr>
            ))}
          </tbody>
        </table>
      </section>
    </SectionPage>
  );
}
