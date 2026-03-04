import { prisma } from "../db.js";
import { AppError } from "../middleware/errorHandler.js";

export const marketplaceService = {
  async listPublished(filters?: { deviceType?: string; language?: string }) {
    const where: Record<string, unknown> = {
      status: { in: ["published", "active"] },
      publication: { isNot: null },
    };

    if (filters?.deviceType && filters.deviceType !== "any") {
      where.deviceType = filters.deviceType;
    }
    if (filters?.language) {
      where.language = filters.language;
    }

    return prisma.study.findMany({
      where,
      include: {
        org: { select: { id: true, name: true } },
        tasks: { select: { id: true, title: true } },
        _count: { select: { assignments: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async acceptStudy(studyId: string, testerId: string) {
    const study = await prisma.study.findUnique({
      where: { id: studyId },
      include: { _count: { select: { assignments: true } } },
    });

    if (!study) throw new AppError(404, "Study not found");
    if (!["published", "active"].includes(study.status)) {
      throw new AppError(400, "Study is not accepting testers");
    }
    if (study._count.assignments >= study.maxTesters) {
      throw new AppError(400, "Study has reached maximum testers");
    }

    const existing = await prisma.assignment.findUnique({
      where: { studyId_testerId: { studyId, testerId } },
    });
    if (existing) throw new AppError(409, "Already accepted this study");

    const assignment = await prisma.assignment.create({
      data: { studyId, testerId },
    });

    if (study.status === "published") {
      await prisma.study.update({ where: { id: studyId }, data: { status: "active" } });
    }

    const session = await prisma.session.create({
      data: { studyId, testerId },
    });

    return { assignment, session };
  },

  async withdraw(studyId: string, testerId: string) {
    const assignment = await prisma.assignment.findUnique({
      where: { studyId_testerId: { studyId, testerId } },
    });
    if (!assignment) throw new AppError(404, "Assignment not found");

    return prisma.assignment.update({
      where: { id: assignment.id },
      data: { status: "withdrawn" },
    });
  },

  async getAssignment(studyId: string, testerId: string) {
    return prisma.assignment.findUnique({
      where: { studyId_testerId: { studyId, testerId } },
    });
  },
};
