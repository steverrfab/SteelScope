import { defaultHardBidTemplate, priceSteelPounds } from "@/domain/pricing";
import { SectionPage } from "@/components/section-page";

export default function EstimatePage() {
  const estimate = priceSteelPounds(86000, defaultHardBidTemplate);
  return (
    <SectionPage eyebrow="Estimate" title="Bid pricing">
      <section className="grid grid-3">
        <div className="card metric">Material<strong>${Math.round(estimate.material).toLocaleString()}</strong></div>
        <div className="card metric">Fabrication<strong>${Math.round(estimate.fabrication).toLocaleString()}</strong></div>
        <div className="card metric">Total bid<strong>${Math.round(estimate.totalBidPrice).toLocaleString()}</strong></div>
      </section>
    </SectionPage>
  );
}
