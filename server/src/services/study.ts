import { prisma } from "../db.js";
import { appEvents } from "../events.js";
import { AppError } from "../middleware/errorHandler.js";

export const studyService = {
  async create(orgId: string, data: {
    name: string;
    goal?: string;
    targetUrls?: string[];
    wcagLevel?: string;
    focusAreas?: string[];
    captureScreen?: boolean;
    captureAudio?: boolean;
    captureWebcam?: boolean;
    deviceType?: string;
    timeEstimate?: string;
    language?: string;
    maxTesters?: number;
  }) {
    return prisma.study.create({
      data: {
        orgId,
        name: data.name,
        goal: data.goal,
        targetUrls: data.targetUrls ? JSON.stringify(data.targetUrls) : null,
        wcagLevel: data.wcagLevel,
        focusAreas: data.focusAreas ? JSON.stringify(data.focusAreas) : null,
        captureScreen: data.captureScreen ?? true,
        captureAudio: data.captureAudio ?? true,
        captureWebcam: data.captureWebcam ?? false,
        deviceType: data.deviceType ?? "any",
        timeEstimate: data.timeEstimate,
        language: data.language ?? "en",
        maxTesters: data.maxTesters ?? 10,
      },
      include: { tasks: true },
    });
  },

  async update(studyId: string, orgId: string, data: Record<string, unknown>) {
    const study = await prisma.study.findUnique({ where: { id: studyId } });
    if (!study) throw new AppError(404, "Study not found");
    if (study.orgId !== orgId) throw new AppError(403, "Not your study");

    const updateData: Record<string, unknown> = {};
    const fields = ["name", "goal", "wcagLevel", "captureScreen", "captureAudio",
      "captureWebcam", "deviceType", "timeEstimate", "language", "maxTesters", "status"];

    for (const f of fields) {
      if (data[f] !== undefined) updateData[f] = data[f];
    }
    if (data.targetUrls) updateData.targetUrls = JSON.stringify(data.targetUrls);
    if (data.focusAreas) updateData.focusAreas = JSON.stringify(data.focusAreas);

    return prisma.study.update({
      where: { id: studyId },
      data: updateData,
      include: { tasks: true },
    });
  },

  async get(studyId: string) {
    const study = await prisma.study.findUnique({
      where: { id: studyId },
      include: { tasks: { orderBy: { sortOrder: "asc" } }, publication: true },
    });
    if (!study) throw new AppError(404, "Study not found");
    return study;
  },

  async listByOrg(orgId: string) {
    return prisma.study.findMany({
      where: { orgId },
      include: { tasks: true, _count: { select: { sessions: true, assignments: true } } },
      orderBy: { updatedAt: "desc" },
    });
  },

  async addTask(studyId: string, data: { title: string; description?: string; successCriteria?: string; sortOrder?: number }) {
    const maxOrder = await prisma.studyTask.aggregate({ where: { studyId }, _max: { sortOrder: true } });
    return prisma.studyTask.create({
      data: {
        studyId,
        title: data.title,
        description: data.description,
        successCriteria: data.successCriteria,
        sortOrder: data.sortOrder ?? (maxOrder._max.sortOrder ?? 0) + 1,
      },
    });
  },

  async updateTask(taskId: string, data: { title?: string; description?: string; successCriteria?: string; sortOrder?: number }) {
    return prisma.studyTask.update({ where: { id: taskId }, data });
  },

  async deleteTask(taskId: string) {
    return prisma.studyTask.delete({ where: { id: taskId } });
  },

  async publish(studyId: string, orgId: string) {
    const study = await prisma.study.findUnique({
      where: { id: studyId },
      include: { tasks: true },
    });
    if (!study) throw new AppError(404, "Study not found");
    if (study.orgId !== orgId) throw new AppError(403, "Not your study");

    const errors = this.validate(study);
    if (errors.length > 0) throw new AppError(400, `Validation failed: ${errors.join(", ")}`);

    await prisma.studyPublication.upsert({
      where: { studyId },
      create: { studyId },
      update: { publishedAt: new Date() },
    });

    const updated = await prisma.study.update({
      where: { id: studyId },
      data: { status: "published" },
      include: { tasks: true, publication: true },
    });

    appEvents.emitApp({ type: "STUDY_PUBLISHED", studyId, orgId });
    return updated;
  },

  validate(study: { tasks: unknown[]; name: string; targetUrls: string | null; goal: string | null }) {
    const errors: string[] = [];
    if (!study.name) errors.push("Study name is required");
    if (!study.targetUrls) errors.push("At least 1 target URL required");
    if (study.tasks.length < 1) errors.push("At least 1 task required");
    return errors;
  },
};
