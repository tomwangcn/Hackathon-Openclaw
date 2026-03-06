import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { conversationService } from "../services/conversation.js";
import { runStudyDesigner } from "../agents/studyDesigner.js";
import { runLiveFacilitator } from "../agents/liveFacilitator.js";
import { runReportAgent } from "../agents/reportAgent.js";
import type { AuthRequest } from "../types.js";

const router = Router();
router.use(authenticate);

router.post("/study-designer", async (req: AuthRequest, res, next) => {
  try {
    const { studyId, message } = req.body;
    if (!message) {
      res.status(400).json({ error: "message is required" });
      return;
    }

    const conv = await conversationService.findOrCreate(
      studyId || "global",
      "study_designer"
    );

    const result = await runStudyDesigner(conv.id, message, studyId);
    res.json({ conversationId: conv.id, ...result });
  } catch (err) {
    next(err);
  }
});

router.post("/facilitator", async (req: AuthRequest, res, next) => {
  try {
    const { sessionId, message, currentTask, timeOnTaskSeconds, completedTasks, totalTasks } = req.body;
    if (!sessionId) {
      res.status(400).json({ error: "sessionId is required" });
      return;
    }

    const conv = await conversationService.findOrCreate(sessionId, "facilitator", "session");

    const result = await runLiveFacilitator({
      sessionId,
      conversationId: conv.id,
      currentTask: currentTask || null,
      timeOnTaskSeconds: timeOnTaskSeconds || 0,
      userMessage: message,
      completedTasks: completedTasks || 0,
      totalTasks: totalTasks || 0,
    });

    res.json({ conversationId: conv.id, ...result });
  } catch (err) {
    next(err);
  }
});

router.post("/report", async (req: AuthRequest, res, next) => {
  try {
    const { studyId } = req.body;
    if (!studyId) {
      res.status(400).json({ error: "studyId is required" });
      return;
    }

    const result = await runReportAgent(studyId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
