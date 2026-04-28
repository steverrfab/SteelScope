import { z } from "zod";
import type { AuthContext } from "@/infrastructure/auth/context";

export const createProjectSchema = z.object({
  name: z.string().min(1),
  bidDate: z.string().optional(),
  clientName: z.string().optional(),
  generalContractor: z.string().optional()
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export interface ProjectSummary {
  id: string;
  name: string;
  bidDate: string | null;
  clientName: string | null;
  generalContractor: string | null;
  status: string;
  fileCount: number;
  pageCount: number;
  reviewFlagCount: number;
}

export interface ProjectRepository {
  list(ctx: AuthContext): Promise<ProjectSummary[]>;
  create(ctx: AuthContext, input: CreateProjectInput): Promise<ProjectSummary>;
}

export class ProjectService {
  constructor(private readonly projects: ProjectRepository) {}

  list(ctx: AuthContext) {
    return this.projects.list(ctx);
  }

  create(ctx: AuthContext, input: CreateProjectInput) {
    return this.projects.create(ctx, input);
  }
}
