import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { interactionService } from "../services/interaction.js";
import type { AuthRequest } from "../types.js";

const router = Router();
router.use(authenticate);

router.post("/:sessionId/batch", async (req: AuthRequest, res, next) => {
  try {
    const { events } = req.body;
    if (!Array.isArray(events)) {
      res.status(400).json({ error: "events array is required" });
      return;
    }
    const result = await interactionService.storeBatch(req.params.sessionId, events);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/:sessionId/timeline", async (req: AuthRequest, res, next) => {
  try {
    const timeline = await interactionService.getInteractionTimeline(req.params.sessionId);
    res.json(timeline);
  } catch (err) {
    next(err);
  }
});

router.get("/:sessionId/summary", async (req: AuthRequest, res, next) => {
  try {
    const summary = await interactionService.getInteractionSummary(req.params.sessionId);
    res.json(summary);
  } catch (err) {
    next(err);
  }
});

router.post("/:sessionId/finalize", async (req: AuthRequest, res, next) => {
  try {
    const summary = await interactionService.saveInteractionArtifact(req.params.sessionId);
    res.json(summary);
  } catch (err) {
    next(err);
  }
});

export default router;
