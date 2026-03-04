import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { sessionService } from "../services/session.js";
import { mediaService } from "../services/media.js";
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

export default router;
