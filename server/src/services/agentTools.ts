import { prisma } from "../db.js";
import { reportService } from "./report.js";
import { AppError } from "../middleware/errorHandler.js";

export const agentToolsService = {
  async getOrgContext(orgId: string) {
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        studies: { select: { id: true, name: true, status: true } },
      },
    });
    if (!org) throw new AppError(404, "Organization not found");
    return org;
  },

  async getStudyContext(studyId: string) {
    const study = await prisma.study.findUnique({
      where: { id: studyId },
      include: {
        tasks: { orderBy: { sortOrder: "asc" } },
        sessions: {
          include: { tester: { select: { id: true, name: true } }, taskResults: true },
        },
        org: { select: { id: true, name: true } },
      },
    });
    if (!study) throw new AppError(404, "Study not found");
    return study;
  },

  async getSessionArtifacts(sessionId: string) {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        artifacts: true,
        events: { orderBy: { timestamp: "asc" } },
        taskResults: true,
        study: { select: { id: true, name: true } },
      },
    });
    if (!session) throw new AppError(404, "Session not found");
    return session;
  },

  async writeReport(studyId: string, data: {
    summary: string;
    findings: { severity: string; title: string; description?: string; frequency?: string; confidence?: number; evidenceCount?: number }[];
    tickets?: { title: string; description?: string; priority: string; labels?: string[]; acceptanceCriteria?: string[] }[];
  }) {
    const report = await prisma.report.create({
      data: {
        studyId,
        status: "ready",
        summary: data.summary,
        reportJson: JSON.stringify(data),
      },
    });

    for (const finding of data.findings) {
      await reportService.addFinding(report.id, finding);
    }

    if (data.tickets) {
      for (const ticket of data.tickets) {
        await reportService.addTicketDraft(report.id, ticket);
      }
    }

    return report;
  },

  async createTicketsDraft(reportId: string, tickets: {
    title: string;
    description?: string;
    priority: string;
    labels?: string[];
    acceptanceCriteria?: string[];
  }[]) {
    const results = [];
    for (const ticket of tickets) {
      const created = await reportService.addTicketDraft(reportId, ticket);
      results.push(created);
    }
    return results;
  },

  async logFacilitatorPrompt(sessionId: string, prompt: string) {
    return prisma.sessionEvent.create({
      data: {
        sessionId,
        type: "facilitator_prompt",
        data: JSON.stringify({ prompt }),
      },
    });
  },
};
