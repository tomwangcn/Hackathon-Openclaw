import { prisma } from "../db.js";

const DEEPFACE_URL = process.env.DEEPFACE_URL || "http://localhost:5050";

interface EmotionResult {
  dominant_emotion: string;
  emotions: Record<string, number>;
  face_detected: boolean;
  face_region?: Record<string, number>;
  error?: string;
}

export const emotionService = {
  async analyze(sessionId: string, imageBase64: string, timestamp?: string): Promise<EmotionResult> {
    const response = await fetch(`${DEEPFACE_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: imageBase64 }),
    });

    const result: EmotionResult = await response.json();

    await prisma.sessionEvent.create({
      data: {
        sessionId,
        type: "emotion",
        data: JSON.stringify(result),
        timestamp: timestamp ? new Date(timestamp) : new Date(),
      },
    });

    return result;
  },

  async getEmotionTimeline(sessionId: string) {
    const events = await prisma.sessionEvent.findMany({
      where: { sessionId, type: "emotion" },
      orderBy: { timestamp: "asc" },
    });

    return events.map((e) => ({
      timestamp: e.timestamp,
      ...JSON.parse(e.data || "{}"),
    }));
  },

  async getEmotionSummary(sessionId: string) {
    const events = await prisma.sessionEvent.findMany({
      where: { sessionId, type: "emotion" },
    });

    if (events.length === 0) {
      return { totalSamples: 0, dominantEmotions: {}, averages: {}, frictionMoments: [] };
    }

    const emotionCounts: Record<string, number> = {};
    const emotionSums: Record<string, number> = {};
    const frictionMoments: { timestamp: Date; emotion: string; confidence: number }[] = [];
    let sampleCount = 0;

    for (const event of events) {
      const data = JSON.parse(event.data || "{}");
      if (!data.face_detected) continue;
      sampleCount++;

      const dominant = data.dominant_emotion;
      emotionCounts[dominant] = (emotionCounts[dominant] || 0) + 1;

      const emotions = data.emotions || {};
      for (const [emotion, value] of Object.entries(emotions)) {
        emotionSums[emotion] = (emotionSums[emotion] || 0) + (value as number);
      }

      if (["angry", "fear", "disgust", "sad"].includes(dominant)) {
        const confidence = emotions[dominant] || 0;
        if (confidence > 40) {
          frictionMoments.push({
            timestamp: event.timestamp,
            emotion: dominant,
            confidence: Math.round(confidence),
          });
        }
      }
    }

    const averages: Record<string, number> = {};
    for (const [emotion, sum] of Object.entries(emotionSums)) {
      averages[emotion] = Math.round((sum / sampleCount) * 100) / 100;
    }

    return {
      totalSamples: sampleCount,
      dominantEmotions: emotionCounts,
      averages,
      frictionMoments,
    };
  },

  async saveEmotionArtifact(sessionId: string) {
    const summary = await this.getEmotionSummary(sessionId);

    await prisma.artifact.create({
      data: {
        sessionId,
        type: "emotion_summary",
        filename: `emotion-summary-${sessionId}.json`,
        mimeType: "application/json",
        storagePath: `artifacts/${sessionId}/emotion-summary.json`,
        sizeBytes: JSON.stringify(summary).length,
      },
    });

    await prisma.sessionEvent.create({
      data: {
        sessionId,
        type: "emotion_summary",
        data: JSON.stringify(summary),
      },
    });

    return summary;
  },
};
