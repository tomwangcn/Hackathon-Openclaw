import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { sessionService } from "../services/session.js";
import { mediaService } from "../services/media.js";
import { prisma } from "../db.js";
import type { AuthRequest } from "../types.js";

const router = Router();
router.use(authenticate);

router.get("/mine", async (req: AuthRequest, res, next) => {
  try {
    const sessions = await sessionService.listByTester(req.user!.userId);
    res.json(sessions);
  } catch (err) { next(err); }
});

router.get("/:id", async (req: AuthRequest, res, next) => {
  try {
    const session = await sessionService.get(req.params.id);
    res.json(session);
  } catch (err) { next(err); }
});

router.get("/study/:studyId", async (req: AuthRequest, res, next) => {
  try {
    const sessions = await sessionService.listByStudy(req.params.studyId);
    res.json(sessions);
  } catch (err) { next(err); }
});

router.post("/:id/start", async (req: AuthRequest, res, next) => {
  try {
    const session = await sessionService.start(req.params.id, req.user!.userId);
    res.json(session);
  } catch (err) { next(err); }
});

router.post("/:id/end", async (req: AuthRequest, res, next) => {
  try {
    const session = await sessionService.end(req.params.id, req.user!.userId);
    res.json(session);
  } catch (err) { next(err); }
});

router.post("/:id/events", async (req: AuthRequest, res, next) => {
  try {
    const { events } = req.body;
    if (!Array.isArray(events)) { res.status(400).json({ error: "events must be an array" }); return; }
    const result = await sessionService.addEvents(req.params.id, events);
    res.json({ count: result.count });
  } catch (err) { next(err); }
});

router.patch("/:id/tasks/:taskId", async (req: AuthRequest, res, next) => {
  try {
    const { completed, notes } = req.body;
    const result = await sessionService.updateTaskResult(req.params.id, req.params.taskId, completed, notes);
    res.json(result);
  } catch (err) { next(err); }
});

router.post("/:id/upload-url", async (req: AuthRequest, res, next) => {
  try {
    const { type, filename } = req.body;
    if (!type || !filename) { res.status(400).json({ error: "type and filename required" }); return; }
    const result = await mediaService.generateUploadUrl(req.params.id, type, filename);
    res.json(result);
  } catch (err) { next(err); }
});

// POST /api/sessions/:id/review — tester approves report and optionally adds a comment
router.post("/:id/review", async (req: AuthRequest, res, next) => {
  try {
    const { comment } = req.body;
    const userId = req.user!.userId;

    const session = await prisma.session.findUnique({ where: { id: req.params.id } });
    if (!session) { res.status(404).json({ error: "Session not found" }); return; }
    if (session.testerId !== userId) { res.status(403).json({ error: "Not your session" }); return; }

    await prisma.session.update({
      where: { id: req.params.id },
      data: { testerApproved: true, testerComment: comment || null },
    });

    // Transition to completed
    if (session.status === "report_ready") {
      await prisma.session.update({
        where: { id: req.params.id },
        data: { status: "completed" },
      });
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// POST /api/sessions/:id/feedback
router.post("/:id/feedback", async (req: AuthRequest, res, next) => {
  try {
    const { rating, feedback: feedbackText, hardestArea, feeling } = req.body;
    const userId = req.user!.userId;

    const fb = await prisma.sessionFeedback.create({
      data: {
        sessionId: req.params.id,
        testerId: userId,
        rating: Math.min(5, Math.max(1, Number(rating))),
        feedback: feedbackText || null,
        hardestArea: hardestArea || null,
        feeling: feeling || null,
      },
    });

    res.json(fb);
  } catch (err) {
    next(err);
  }
});

export default router;
