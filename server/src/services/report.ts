import { prisma } from "../db.js";
import { appEvents } from "../events.js";
import { AppError } from "../middleware/errorHandler.js";
import { emotionService } from "./emotion.js";
import { interactionService } from "./interaction.js";

export const reportService = {
  async generate(studyId: string) {
    const study = await prisma.study.findUnique({
      where: { id: studyId },
      include: { sessions: { include: { taskResults: true, events: true, artifacts: true } }, tasks: true },
    });
    if (!study) throw new AppError(404, "Study not found");

    const report = await prisma.report.create({
      data: {
        studyId,
        status: "generating",
        summary: "Report generation in progress...",
      },
    });

    setTimeout(async () => {
      try {
        const completedSessions = study.sessions.filter((s) => s.status === "report_ready" || s.status === "completed");

        const emotionData = await Promise.all(
          completedSessions.map(async (session) => {
            const summary = await emotionService.getEmotionSummary(session.id);
            return { sessionId: session.id, ...summary };
          })
        );

        const aggregateEmotions: Record<string, number> = {};
        let totalSamples = 0;
        const allFrictionMoments: { sessionId: string; timestamp: Date; emotion: string; confidence: number }[] = [];

        for (const ed of emotionData) {
          totalSamples += ed.totalSamples;
          for (const [emotion, avg] of Object.entries(ed.averages)) {
            aggregateEmotions[emotion] = (aggregateEmotions[emotion] || 0) + avg * ed.totalSamples;
          }
          for (const fm of ed.frictionMoments) {
            allFrictionMoments.push({ sessionId: ed.sessionId, ...fm });
          }
        }

        if (totalSamples > 0) {
          for (const emotion of Object.keys(aggregateEmotions)) {
            aggregateEmotions[emotion] = Math.round((aggregateEmotions[emotion] / totalSamples) * 100) / 100;
          }
        }

        const interactionData = await Promise.all(
          completedSessions.map(async (session) => {
            const summary = await interactionService.getInteractionSummary(session.id);
            return { sessionId: session.id, ...summary };
          })
        );

        const totalRageClicks = interactionData.reduce((sum, d) => sum + (d.counts["rage_click"] || 0), 0);
        const totalFreezes = interactionData.reduce((sum, d) => sum + (d.counts["freeze"] || 0), 0);
        const totalMisclicks = interactionData.reduce((sum, d) => sum + (d.counts["misclick"] || 0), 0);
        const avgFrictionScore = interactionData.length > 0
          ? Math.round(interactionData.reduce((sum, d) => sum + d.frictionScore, 0) / interactionData.length)
          : 0;

        await prisma.report.update({
          where: { id: report.id },
          data: {
            status: "ready",
            summary: `Accessibility report for "${study.name}" based on ${completedSessions.length} sessions.`,
            reportJson: JSON.stringify({
              studyName: study.name,
              totalSessions: completedSessions.length,
              generatedAt: new Date().toISOString(),
              emotionAnalysis: {
                totalSamples,
                averageEmotions: aggregateEmotions,
                frictionMoments: allFrictionMoments,
                perSession: emotionData,
              },
              interactionAnalysis: {
                totalRageClicks,
                totalFreezes,
                totalMisclicks,
                averageFrictionScore: avgFrictionScore,
                perSession: interactionData,
              },
            }),
          },
        });

        appEvents.emitApp({ type: "REPORT_READY", reportId: report.id, studyId });
      } catch (err) {
        console.error(`[report] Error generating report ${report.id}:`, err);
      }
    }, 2000);

    return report;
  },

  async get(reportId: string) {
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: { findings: true, tickets: true, study: { select: { id: true, name: true, orgId: true } } },
    });
    if (!report) throw new AppError(404, "Report not found");
    return report;
  },

  async listByStudy(studyId: string) {
    return prisma.report.findMany({
      where: { studyId },
      include: { _count: { select: { findings: true, tickets: true } } },
      orderBy: { createdAt: "desc" },
    });
  },

  async addFinding(reportId: string, data: {
    severity: string;
    title: string;
    description?: string;
    frequency?: string;
    confidence?: number;
    evidenceCount?: number;
  }) {
    return prisma.finding.create({ data: { reportId, ...data } });
  },

  async addTicketDraft(reportId: string, data: {
    title: string;
    description?: string;
    priority: string;
    labels?: string[];
    acceptanceCriteria?: string[];
  }) {
    return prisma.jiraTicket.create({
      data: {
        reportId,
        title: data.title,
        description: data.description,
        priority: data.priority,
        labels: data.labels ? JSON.stringify(data.labels) : null,
        acceptanceCriteria: data.acceptanceCriteria ? JSON.stringify(data.acceptanceCriteria) : null,
      },
    });
  },
};
