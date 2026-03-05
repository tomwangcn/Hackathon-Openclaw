import { appEvents } from "../events.js";
import { sessionService } from "./session.js";
import { notificationService } from "./notification.js";
import { processingService } from "./processing.js";
import { prisma } from "../db.js";

export function initOrchestrator() {
  appEvents.onApp("STUDY_PUBLISHED", async (event) => {
    const study = await prisma.study.findUnique({
      where: { id: event.studyId },
      include: { org: true },
    });
    if (!study) return;
    console.log(`[orchestrator] Study published: ${study.name} (${event.studyId})`);
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
      include: { tester: true },
    });
    if (session) {
      await notificationService.create({
        userId: session.testerId,
        type: "processing_done",
        title: "Report ready",
        body: `Your session report is ready to view`,
      });
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
