import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { conversationService } from "../services/conversation.js";
import type { AuthRequest } from "../types.js";

const router = Router();
router.use(authenticate);

router.post("/", async (req: AuthRequest, res, next) => {
  try {
    const { studyId, sessionId, channel, agentType } = req.body;
    const conv = await conversationService.create({ studyId, sessionId, channel, agentType });
    res.status(201).json(conv);
  } catch (err) { next(err); }
});

router.get("/:id", async (req: AuthRequest, res, next) => {
  try {
    const conv = await conversationService.get(req.params.id);
    res.json(conv);
  } catch (err) { next(err); }
});

router.get("/:id/context", async (req: AuthRequest, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const messages = await conversationService.getContextWindow(req.params.id, limit);
    res.json(messages);
  } catch (err) { next(err); }
});

router.post("/:id/messages", async (req: AuthRequest, res, next) => {
  try {
    const { role, content, idempotencyKey } = req.body;
    if (!content) { res.status(400).json({ error: "content is required" }); return; }

    const message = await conversationService.addMessage({
      conversationId: req.params.id,
      role: role || "user",
      content,
      senderId: req.user!.userId,
      idempotencyKey,
    });
    res.status(201).json(message);
  } catch (err) { next(err); }
});

router.get("/study/:studyId", async (req: AuthRequest, res, next) => {
  try {
    const conversations = await conversationService.listByStudy(req.params.studyId);
    res.json(conversations);
  } catch (err) { next(err); }
});

router.post("/find-or-create", async (req: AuthRequest, res, next) => {
  try {
    const { studyId, agentType } = req.body;
    if (!studyId || !agentType) { res.status(400).json({ error: "studyId and agentType required" }); return; }
    const conv = await conversationService.findOrCreate(studyId, agentType);
    res.json(conv);
  } catch (err) { next(err); }
});

export default router;
