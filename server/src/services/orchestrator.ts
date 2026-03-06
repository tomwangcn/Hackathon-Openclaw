import { appEvents } from "../events.js";
import { sessionService } from "./session.js";
import { notificationService } from "./notification.js";
import { processingService } from "./processing.js";
import { prisma } from "../db.js";
import { sendJobOffer, sendCompletionNotice } from "../lib/telegram.js";
import { runReportAgent } from "../agents/reportAgent.js";

export function initOrchestrator() {
  appEvents.onApp("STUDY_PUBLISHED", async (event) => {
    const study = await prisma.study.findUnique({
      where: { id: event.studyId },
      include: { org: true },
    });
    if (!study) return;
    console.log(`[orchestrator] Study published: ${study.name} (${event.studyId})`);

    // Send Telegram notifications to linked testers
    try {
      const testers = await prisma.testerProfile.findMany({
        where: { telegramLinked: true, telegramChatId: { not: null } },
        include: { user: true },
      });

      for (const tester of testers) {
        const existing = await prisma.jobNotification.findFirst({
          where: { studyId: event.studyId, testerId: tester.userId },
        });
        if (existing) continue;

        try {
          const { messageId } = await sendJobOffer({
            chatId: tester.telegramChatId!,
            testerName: tester.user.name,
            studyName: study.name,
            orgName: study.org?.name || "Unknown",
            estimatedDuration: study.timeEstimate || "~30 min",
            studyId: event.studyId,
          });

          await prisma.jobNotification.create({
            data: {
              studyId: event.studyId,
              testerId: tester.userId,
              messageId: String(messageId),
            },
          });
        } catch (err) {
          console.error(`[orchestrator] Telegram send failed for ${tester.userId}:`, err);
        }
      }
      console.log(`[orchestrator] Sent Telegram offers to ${testers.length} testers`);
    } catch (err) {
      console.error("[orchestrator] Telegram notification error:", err);
    }
  });

  appEvents.onApp("SESSION_STARTED", async (event) => {
    const session = await prisma.session.findUnique({
      where: { id: event.sessionId },
      include: { study: { include: { org: true } }, tester: true },
    });
    if (!session) return;
    console.log(`[orchestrator] Session started: ${event.sessionId}`);

    const orgMembers = await prisma.orgMembership.findMany({
      where: { orgId: session.study.orgId },
    });

    for (const member of orgMembers) {
      await notificationService.create({
        userId: member.userId,
        type: "session_started",
        title: "Session started",
        body: `${session.tester.name} started testing "${session.study.name}"`,
      });
    }
  });

  appEvents.onApp("SESSION_ENDED", async (event) => {
    console.log(`[orchestrator] Session ended: ${event.sessionId}, enqueueing processing`);
    await processingService.enqueueAll(event.sessionId);
  });

  appEvents.onApp("PROCESSING_DONE", async (event) => {
    console.log(`[orchestrator] Processing done: ${event.sessionId}`);
    await sessionService.transition(event.sessionId, "report_ready");

    const session = await prisma.session.findUnique({
      where: { id: event.sessionId },
      include: { tester: true, study: true },
    });

    // Auto-generate report via agent
    if (session) {
      console.log(`[orchestrator] Auto-generating report for study ${session.studyId}`);
      runReportAgent(session.studyId).catch((err) =>
        console.error("[orchestrator] Report agent failed:", err)
      );
    }
    if (session) {
      await notificationService.create({
        userId: session.testerId,
        type: "processing_done",
        title: "Report ready",
        body: `Your session report is ready to view`,
      });

      // Telegram completion notice
      try {
        const profile = await prisma.testerProfile.findUnique({
          where: { userId: session.testerId },
        });
        if (profile?.telegramLinked && profile?.telegramChatId) {
          await sendCompletionNotice({
            chatId: profile.telegramChatId,
            studyName: session.study?.name,
          });
        }
      } catch (err) {
        console.error("[orchestrator] Telegram completion notice failed:", err);
      }
    }
  });

  appEvents.onApp("REPORT_READY", async (event) => {
    console.log(`[orchestrator] Report ready: ${event.reportId} for study ${event.studyId}`);
    const study = await prisma.study.findUnique({
      where: { id: event.studyId },
      include: { org: true },
    });
    if (!study) return;

    const orgMembers = await prisma.orgMembership.findMany({
      where: { orgId: study.orgId },
    });

    for (const member of orgMembers) {
      await notificationService.create({
        userId: member.userId,
        type: "report_ready",
        title: "New report available",
        body: `Report for "${study.name}" is ready to review`,
        data: JSON.stringify({ reportId: event.reportId, studyId: event.studyId }),
      });
    }
  });

  console.log("[orchestrator] Event listeners initialized");
}
