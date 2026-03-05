import { prisma } from "../db.js";
import { appEvents } from "../events.js";
import { AppError } from "../middleware/errorHandler.js";
import type { SessionStatus } from "../types.js";

const VALID_TRANSITIONS: Record<string, string[]> = {
  not_started: ["in_session"],
  in_session: ["uploading"],
  uploading: ["processing"],
  processing: ["report_ready"],
  report_ready: ["completed"],
};

export const sessionService = {
  async get(sessionId: string) {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        study: { include: { tasks: { orderBy: { sortOrder: "asc" } } } },
        taskResults: true,
        artifacts: true,
      },
    });
    if (!session) throw new AppError(404, "Session not found");
    return session;
  },

  async listByStudy(studyId: string) {
    return prisma.session.findMany({
      where: { studyId },
      include: { tester: { select: { id: true, name: true } }, taskResults: true },
      orderBy: { createdAt: "desc" },
    });
  },

  async listByTester(testerId: string) {
    return prisma.session.findMany({
      where: { testerId },
      include: {
        study: { include: { tasks: { orderBy: { sortOrder: "asc" } }, org: { select: { name: true } } } },
        taskResults: true,
      },
      orderBy: { updatedAt: "desc" },
    });
  },

  async start(sessionId: string, testerId: string) {
    const session = await this.get(sessionId);
    if (session.testerId !== testerId) throw new AppError(403, "Not your session");
    this.assertTransition(session.status, "in_session");

    const updated = await prisma.session.update({
      where: { id: sessionId },
      data: { status: "in_session", startedAt: new Date() },
    });

    appEvents.emitApp({ type: "SESSION_STARTED", sessionId });
    return updated;
  },

  async end(sessionId: string, testerId: string) {
    const session = await this.get(sessionId);
    if (session.testerId !== testerId) throw new AppError(403, "Not your session");
    this.assertTransition(session.status, "uploading");

    const updated = await prisma.session.update({
      where: { id: sessionId },
      data: { status: "uploading", endedAt: new Date() },
    });

    appEvents.emitApp({ type: "SESSION_ENDED", sessionId });
    return updated;
  },

  async transition(sessionId: string, newStatus: SessionStatus) {
    const session = await prisma.session.findUnique({ where: { id: sessionId } });
    if (!session) throw new AppError(404, "Session not found");
    this.assertTransition(session.status, newStatus);

    return prisma.session.update({
      where: { id: sessionId },
      data: { status: newStatus },
    });
  },

  async addEvents(sessionId: string, events: { type: string; data?: string; timestamp?: string }[]) {
    return prisma.sessionEvent.createMany({
      data: events.map((e) => ({
        sessionId,
        type: e.type,
        data: e.data,
        timestamp: e.timestamp ? new Date(e.timestamp) : new Date(),
      })),
    });
  },

  async updateTaskResult(sessionId: string, taskId: string, completed: boolean, notes?: string) {
    return prisma.sessionTaskResult.upsert({
      where: { sessionId_taskId: { sessionId, taskId } },
      create: { sessionId, taskId, completed, notes },
      update: { completed, notes },
    });
  },

  assertTransition(current: string, next: string) {
    const allowed = VALID_TRANSITIONS[current];
    if (!allowed?.includes(next)) {
      throw new AppError(400, `Cannot transition from "${current}" to "${next}"`);
    }
  },
};
