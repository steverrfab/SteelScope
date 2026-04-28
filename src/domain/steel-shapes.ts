export type ShapeFamily =
  | "W"
  | "S"
  | "M"
  | "HP"
  | "C"
  | "MC"
  | "L"
  | "HSS_RECT"
  | "HSS_SQUARE"
  | "HSS_ROUND"
  | "PIPE"
  | "PLATE"
  | "BAR"
  | "ROD";

export interface SteelShape {
  id: string;
  family: ShapeFamily;
  size: string;
  weightPerFoot: number;
  depthInches?: number;
  widthInches?: number;
  thicknessInches?: number;
  areaSquareInches?: number;
  source: "aisc" | "manufacturer" | "manual";
}

export interface ShapeTakeoffInput {
  shape: SteelShape;
  lengthFeet: number;
  quantity: number;
  wasteFactorPercent?: number;
}

export interface ShapeTakeoffResult {
  pieceCount: number;
  totalLengthFeet: number;
  netPounds: number;
  wastePounds: number;
  totalPounds: number;
  totalTons: number;
  truckloads: number;
}

const POUNDS_PER_TON = 2000;
const POUNDS_PER_TRUCKLOAD = 44000;

export function calculateShapeTakeoff(input: ShapeTakeoffInput): ShapeTakeoffResult {
  if (input.lengthFeet <= 0) throw new Error("Length must be greater than zero.");
  if (input.quantity <= 0) throw new Error("Quantity must be greater than zero.");
  if (input.shape.weightPerFoot <= 0) throw new Error("Weight per foot must be greater than zero.");

  const pieceCount = input.quantity;
  const totalLengthFeet = input.lengthFeet * pieceCount;
  const netPounds = totalLengthFeet * input.shape.weightPerFoot;
  const wasteFactor = Math.max(input.wasteFactorPercent ?? 0, 0) / 100;
  const wastePounds = netPounds * wasteFactor;
  const totalPounds = netPounds + wastePounds;

  return {
    pieceCount,
    totalLengthFeet,
    netPounds,
    wastePounds,
    totalPounds,
    totalTons: totalPounds / POUNDS_PER_TON,
    truckloads: Math.ceil(totalPounds / POUNDS_PER_TRUCKLOAD)
  };
}

export const seedSteelShapes: SteelShape[] = [
  { id: "w8x10", family: "W", size: "W8x10", weightPerFoot: 10, depthInches: 7.89, source: "aisc" },
  { id: "w10x12", family: "W", size: "W10x12", weightPerFoot: 12, depthInches: 9.87, source: "aisc" },
  { id: "w12x26", family: "W", size: "W12x26", weightPerFoot: 26, depthInches: 12.22, source: "aisc" },
  { id: "w16x31", family: "W", size: "W16x31", weightPerFoot: 31, depthInches: 15.88, source: "aisc" },
  { id: "w18x35", family: "W", size: "W18x35", weightPerFoot: 35, depthInches: 17.7, source: "aisc" },
  { id: "w21x44", family: "W", size: "W21x44", weightPerFoot: 44, depthInches: 20.66, source: "aisc" },
  { id: "c8x11_5", family: "C", size: "C8x11.5", weightPerFoot: 11.5, depthInches: 8, source: "aisc" },
  { id: "mc6x15_1", family: "MC", size: "MC6x15.1", weightPerFoot: 15.1, depthInches: 6, source: "aisc" },
  { id: "l4x4x3_8", family: "L", size: "L4x4x3/8", weightPerFoot: 9.8, source: "aisc" },
  { id: "hss4x4x1_4", family: "HSS_SQUARE", size: "HSS4x4x1/4", weightPerFoot: 12.21, source: "aisc" },
  { id: "hss6x4x3_8", family: "HSS_RECT", size: "HSS6x4x3/8", weightPerFoot: 24.82, source: "aisc" },
  { id: "pipe4std", family: "PIPE", size: "Pipe 4 STD", weightPerFoot: 10.79, source: "aisc" }
];
