import type { ProjectRepository } from "@/application/projects";
import type { AuthContext } from "@/infrastructure/auth/context";
import { getPrisma } from "@/infrastructure/database/prisma";

export class PrismaProjectRepository implements ProjectRepository {
  async list(ctx: AuthContext) {
    const prisma = getPrisma();
    const projects = await prisma.project.findMany({
      where: { organizationId: ctx.organizationId },
      orderBy: { updatedAt: "desc" },
      include: {
        _count: {
          select: {
            files: true,
            pages: true,
            riskFlags: true
          }
        }
      }
    });

    return projects.map((project) => ({
      id: project.id,
      name: project.name,
      bidDate: project.bidDate?.toISOString() ?? null,
      clientName: project.clientName,
      generalContractor: project.generalContractor,
      status: project.status,
      fileCount: project._count.files,
      pageCount: project._count.pages,
      reviewFlagCount: project._count.riskFlags
    }));
  }

  async create(ctx: AuthContext, input: { name: string; bidDate?: string; clientName?: string; generalContractor?: string }) {
    const prisma = getPrisma();
    const project = await prisma.project.create({
      data: {
        organizationId: ctx.organizationId,
        name: input.name,
        bidDate: input.bidDate ? new Date(input.bidDate) : undefined,
        clientName: input.clientName,
        generalContractor: input.generalContractor
      }
    });

    return {
      id: project.id,
      name: project.name,
      bidDate: project.bidDate?.toISOString() ?? null,
      clientName: project.clientName,
      generalContractor: project.generalContractor,
      status: project.status,
      fileCount: 0,
      pageCount: 0,
      reviewFlagCount: 0
    };
  }
}
