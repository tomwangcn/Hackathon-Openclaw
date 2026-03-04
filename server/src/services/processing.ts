import { prisma } from "../db.js";
import { appEvents } from "../events.js";
import { sessionService } from "./session.js";

interface Job {
  id: string;
  type: string;
  sessionId: string;
  status: "queued" | "running" | "done" | "failed";
}

const jobQueue: Job[] = [];

export const processingService = {
  async enqueueAll(sessionId: string) {
    await sessionService.transition(sessionId, "processing");

    this.enqueue(sessionId, "transcription");
    this.enqueue(sessionId, "event_aggregation");
    this.enqueue(sessionId, "a11y_scan");

    // V1: simulate processing with a delay
    setTimeout(async () => {
      try {
        await this.processTranscription(sessionId);
        await this.processEventAggregation(sessionId);
        await this.processA11yScan(sessionId);

        appEvents.emitApp({ type: "PROCESSING_DONE", sessionId });
      } catch (err) {
        console.error(`[processing] Error processing session ${sessionId}:`, err);
      }
    }, 3000);
  },

  enqueue(sessionId: string, type: string) {
    const job: Job = {
      id: `${type}-${sessionId}-${Date.now()}`,
      type,
      sessionId,
      status: "queued",
    };
    jobQueue.push(job);
    console.log(`[processing] Enqueued ${type} for session ${sessionId}`);
    return job;
  },

  async processTranscription(sessionId: string) {
    console.log(`[processing] Running transcription for session ${sessionId}`);
    // V1 stub: In production, this pulls audio artifacts from S3,
    // sends to Whisper/Deepgram, and stores timestamped transcript.
    const artifacts = await prisma.artifact.findMany({
      where: { sessionId, type: "audio" },
    });
    console.log(`[processing] Found ${artifacts.length} audio artifacts to transcribe`);
  },

  async processEventAggregation(sessionId: string) {
    console.log(`[processing] Running event aggregation for session ${sessionId}`);
    // V1 stub: Aggregates session events into metrics (time-on-task, click patterns, etc.)
    const events = await prisma.sessionEvent.findMany({ where: { sessionId } });
    console.log(`[processing] Aggregated ${events.length} events`);
  },

  async processA11yScan(sessionId: string) {
    console.log(`[processing] Running a11y scan for session ${sessionId}`);
    // V1 stub: In production, runs axe-core/pa11y against target URLs
  },

  getQueue() {
    return jobQueue;
  },
};
