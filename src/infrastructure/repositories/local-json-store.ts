import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export interface LocalProject {
  id: string;
  organizationId: string;
  name: string;
  bidDate: string | null;
  clientName: string | null;
  generalContractor: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface LocalFile {
  id: string;
  organizationId: string;
  projectId: string;
  displayName: string;
  contentType: string;
  sizeBytes: number;
  checksum: string | null;
  uploadId: string | null;
  objectKey: string | null;
  status: string;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LocalDocument {
  id: string;
  projectId: string;
  fileId: string;
  title: string;
  kind: string;
  pageCount: number;
}

export interface LocalPage {
  id: string;
  projectId: string;
  fileId: string;
  documentId: string;
  pageNumber: number;
  width?: number;
  height?: number;
  vectorTextConfidence?: number;
  ocrConfidence?: number;
  processingStatus: string;
  pageType: string;
  discipline: string;
  searchText: string;
}

export interface LocalDrawingSheet {
  id: string;
  projectId: string;
  pageId: string;
  sheetNumber?: string;
  sheetTitle?: string;
  discipline: string;
  scale?: string;
  confidence: number;
}

export interface LocalOcrText {
  id: string;
  pageId: string;
  source: string;
  text: string;
  confidence: number;
}

export interface LocalEntity {
  id: string;
  projectId: string;
  pageId?: string;
  family: string;
  label: string;
  value?: string;
  confidence: number;
  reason: string;
  evidence: unknown;
  reviewStatus: string;
  createdAt: string;
}

export interface LocalRiskFlag {
  id: string;
  projectId: string;
  pageId?: string;
  severity: string;
  category: string;
  title: string;
  detail: string;
  evidence: unknown;
  reviewStatus: string;
  createdAt: string;
}

export interface LocalTakeoffItem {
  id: string;
  projectId: string;
  category: string;
  memberType: string;
  shape?: string;
  size?: string;
  lengthFeet?: number;
  quantity: number;
  weightPerFoot?: number;
  totalWeightPounds?: number;
  materialGrade?: string;
  finish?: string;
  location?: string;
  gridlineLocation?: string;
  detailReference?: string;
  specReference?: string;
  notes?: string;
  confidenceScore: number;
  manualReviewFlag: boolean;
  sourceCitation: unknown;
  estimatorApprovalStatus: string;
}

export interface LocalDb {
  projects: LocalProject[];
  files: LocalFile[];
  documents: LocalDocument[];
  pages: LocalPage[];
  drawingSheets: LocalDrawingSheet[];
  ocrTexts: LocalOcrText[];
  entities: LocalEntity[];
  riskFlags: LocalRiskFlag[];
  takeoffItems: LocalTakeoffItem[];
}

const emptyDb = (): LocalDb => ({
  projects: [],
  files: [],
  documents: [],
  pages: [],
  drawingSheets: [],
  ocrTexts: [],
  entities: [],
  riskFlags: [],
  takeoffItems: []
});

export class LocalJsonStore {
  constructor(private readonly filePath = path.join(process.cwd(), ".data", "local-db.json")) {}

  async read(): Promise<LocalDb> {
    try {
      return JSON.parse(await readFile(this.filePath, "utf8")) as LocalDb;
    } catch {
      return emptyDb();
    }
  }

  async write(db: LocalDb) {
    await mkdir(path.dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, JSON.stringify(db, null, 2));
  }

  async update<T>(fn: (db: LocalDb) => T): Promise<T> {
    const db = await this.read();
    const result = fn(db);
    await this.write(db);
    return result;
  }
}
