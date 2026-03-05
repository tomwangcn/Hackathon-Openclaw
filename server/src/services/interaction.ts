import { prisma } from "../db.js";

interface InteractionEvent {
  type: "click" | "mousemove" | "rage_click" | "freeze" | "misclick";
  x: number;
  y: number;
  timestamp: number;
  meta?: Record<string, any>;
}

export const interactionService = {
  async storeBatch(sessionId: string, events: InteractionEvent[]) {
    const significantTypes = ["rage_click", "freeze", "misclick"];
    const toStore = events.filter((e) => significantTypes.includes(e.type));

    if (toStore.length === 0) return { stored: 0 };

    await prisma.sessionEvent.createMany({
      data: toStore.map((e) => ({
        sessionId,
        type: `interaction_${e.type}`,
        data: JSON.stringify({ x: e.x, y: e.y, meta: e.meta }),
        timestamp: new Date(e.timestamp),
      })),
    });

    return { stored: toStore.length };
  },

  async getInteractionTimeline(sessionId: string) {
    const events = await prisma.sessionEvent.findMany({
      where: {
        sessionId,
        type: { startsWith: "interaction_" },
      },
      orderBy: { timestamp: "asc" },
    });

    return events.map((e) => ({
      type: e.type.replace("interaction_", ""),
      timestamp: e.timestamp,
      ...JSON.parse(e.data || "{}"),
    }));
  },

  async getInteractionSummary(sessionId: string) {
    const events = await prisma.sessionEvent.findMany({
      where: {
        sessionId,
        type: { startsWith: "interaction_" },
      },
    });

    const counts: Record<string, number> = {};
    const rageClicks: { timestamp: Date; x: number; y: number; clickCount: number }[] = [];
    const freezes: { timestamp: Date; durationMs: number }[] = [];
    const misclicks: { timestamp: Date; x: number; y: number; tagName: string }[] = [];

    for (const event of events) {
      const shortType = event.type.replace("interaction_", "");
      counts[shortType] = (counts[shortType] || 0) + 1;

      const data = JSON.parse(event.data || "{}");

      if (shortType === "rage_click") {
        rageClicks.push({
          timestamp: event.timestamp,
          x: data.x,
          y: data.y,
          clickCount: data.meta?.clickCount || 0,
        });
      } else if (shortType === "freeze") {
        freezes.push({
          timestamp: event.timestamp,
          durationMs: data.meta?.durationMs || 0,
        });
      } else if (shortType === "misclick") {
        misclicks.push({
          timestamp: event.timestamp,
          x: data.x,
          y: data.y,
          tagName: data.meta?.tagName || "unknown",
        });
      }
    }

    return {
      totalEvents: events.length,
      counts,
      rageClicks,
      freezes,
      misclicks,
      frictionScore: calculateFrictionScore(counts),
    };
  },

  async saveInteractionArtifact(sessionId: string) {
    const summary = await this.getInteractionSummary(sessionId);

    await prisma.artifact.create({
      data: {
        sessionId,
        type: "interaction_summary",
        filename: `interaction-summary-${sessionId}.json`,
        mimeType: "application/json",
        storagePath: `artifacts/${sessionId}/interaction-summary.json`,
        sizeBytes: JSON.stringify(summary).length,
      },
    });

    await prisma.sessionEvent.create({
      data: {
        sessionId,
        type: "interaction_summary",
        data: JSON.stringify(summary),
      },
    });

    return summary;
  },
};

function calculateFrictionScore(counts: Record<string, number>): number {
  const rageWeight = 5;
  const freezeWeight = 3;
  const misclickWeight = 2;

  const raw =
    (counts["rage_click"] || 0) * rageWeight +
    (counts["freeze"] || 0) * freezeWeight +
    (counts["misclick"] || 0) * misclickWeight;

  return Math.min(100, Math.round(raw));
}
