export interface PricingTemplate {
  id: string;
  name: string;
  mode:
    | "structural_steel_only"
    | "misc_metals_only"
    | "fabrication_only"
    | "processing_only"
    | "furnish_only"
    | "furnish_and_install"
    | "budget_estimate"
    | "hard_bid"
    | "unit_price_bid"
    | "design_build";
  materialCostPerPound: number;
  shopLaborRate: number;
  fabricationHoursPerTon: number;
  processingCostPerPound: number;
  detailingCost: number;
  engineeringCost: number;
  connectionDesignCost: number;
  projectManagementCost: number;
  finishingCostPerPound: number;
  deliveryCost: number;
  installLaborCost?: number;
  equipmentRentalCost?: number;
  taxPercent: number;
  overheadPercent: number;
  profitPercent: number;
  contingencyPercent: number;
  bondPercent: number;
  insurancePercent: number;
  fuelSurchargePercent: number;
  smallJobMinimum: number;
  mobilization: number;
}

export interface EstimateBreakdown {
  material: number;
  processing: number;
  fabrication: number;
  finishing: number;
  detailing: number;
  engineering: number;
  delivery: number;
  installation: number;
  equipment: number;
  projectManagement: number;
  subtotal: number;
  tax: number;
  overhead: number;
  profit: number;
  contingency: number;
  bond: number;
  insurance: number;
  fuelSurcharge: number;
  mobilization: number;
  totalBidPrice: number;
}

export function priceSteelPounds(
  totalPounds: number,
  template: PricingTemplate
): EstimateBreakdown {
  if (totalPounds < 0) throw new Error("Total pounds cannot be negative.");

  const tons = totalPounds / 2000;
  const material = totalPounds * template.materialCostPerPound;
  const processing = totalPounds * template.processingCostPerPound;
  const fabrication = tons * template.fabricationHoursPerTon * template.shopLaborRate;
  const finishing = totalPounds * template.finishingCostPerPound;
  const detailing = template.detailingCost;
  const engineering = template.engineeringCost + template.connectionDesignCost;
  const delivery = template.deliveryCost;
  const installation = template.installLaborCost ?? 0;
  const equipment = template.equipmentRentalCost ?? 0;
  const projectManagement = template.projectManagementCost;

  const subtotalBeforeMinimum =
    material +
    processing +
    fabrication +
    finishing +
    detailing +
    engineering +
    delivery +
    installation +
    equipment +
    projectManagement;

  const subtotal = Math.max(subtotalBeforeMinimum, template.smallJobMinimum);
  const tax = percent(subtotal, template.taxPercent);
  const overhead = percent(subtotal, template.overheadPercent);
  const contingency = percent(subtotal, template.contingencyPercent);
  const bond = percent(subtotal, template.bondPercent);
  const insurance = percent(subtotal, template.insurancePercent);
  const fuelSurcharge = percent(delivery, template.fuelSurchargePercent);
  const profitBase = subtotal + tax + overhead + contingency + bond + insurance + fuelSurcharge;
  const profit = percent(profitBase, template.profitPercent);
  const mobilization = template.mobilization;

  return {
    material,
    processing,
    fabrication,
    finishing,
    detailing,
    engineering,
    delivery,
    installation,
    equipment,
    projectManagement,
    subtotal,
    tax,
    overhead,
    profit,
    contingency,
    bond,
    insurance,
    fuelSurcharge,
    mobilization,
    totalBidPrice: profitBase + profit + mobilization
  };
}

function percent(value: number, pct: number): number {
  return value * (Math.max(pct, 0) / 100);
}

export const defaultHardBidTemplate: PricingTemplate = {
  id: "hard-bid-default",
  name: "Hard Bid - Furnish and Install",
  mode: "hard_bid",
  materialCostPerPound: 1.18,
  shopLaborRate: 92,
  fabricationHoursPerTon: 16,
  processingCostPerPound: 0.18,
  detailingCost: 8500,
  engineeringCost: 2500,
  connectionDesignCost: 3500,
  projectManagementCost: 4500,
  finishingCostPerPound: 0.14,
  deliveryCost: 3800,
  installLaborCost: 0,
  equipmentRentalCost: 0,
  taxPercent: 0,
  overheadPercent: 12,
  profitPercent: 10,
  contingencyPercent: 3,
  bondPercent: 0,
  insurancePercent: 1.2,
  fuelSurchargePercent: 4,
  smallJobMinimum: 25000,
  mobilization: 0
};
