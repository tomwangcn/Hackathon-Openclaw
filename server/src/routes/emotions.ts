import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { emotionService } from "../services/emotion.js";
import type { AuthRequest } from "../types.js";

const router = Router();
router.use(authenticate);

router.post("/:sessionId/analyze", async (req: AuthRequest, res, next) => {
  try {
    const { image, timestamp } = req.body;
    if (!image) {
      res.status(400).json({ error: "image (base64) is required" });
      return;
    }
    const result = await emotionService.analyze(req.params.sessionId, image, timestamp);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/:sessionId/timeline", async (req: AuthRequest, res, next) => {
  try {
    const timeline = await emotionService.getEmotionTimeline(req.params.sessionId);
    res.json(timeline);
  } catch (err) {
    next(err);
  }
});

router.get("/:sessionId/summary", async (req: AuthRequest, res, next) => {
  try {
    const summary = await emotionService.getEmotionSummary(req.params.sessionId);
    res.json(summary);
  } catch (err) {
    next(err);
  }
});

router.post("/:sessionId/finalize", async (req: AuthRequest, res, next) => {
  try {
    const summary = await emotionService.saveEmotionArtifact(req.params.sessionId);
    res.json(summary);
  } catch (err) {
    next(err);
  }
});

export default router;
