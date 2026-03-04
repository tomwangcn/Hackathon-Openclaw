import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { notificationService } from "../services/notification.js";
import type { AuthRequest } from "../types.js";

const router = Router();
router.use(authenticate);

router.get("/", async (req: AuthRequest, res, next) => {
  try {
    const unreadOnly = req.query.unread === "true";
    const notifications = await notificationService.getByUser(req.user!.userId, unreadOnly);
    res.json(notifications);
  } catch (err) { next(err); }
});

router.get("/stream", (req: AuthRequest, res) => {
  notificationService.registerSSE(req.user!.userId, res);
});

router.patch("/:id/read", async (req: AuthRequest, res, next) => {
  try {
    await notificationService.markRead(req.params.id, req.user!.userId);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

router.post("/read-all", async (req: AuthRequest, res, next) => {
  try {
    await notificationService.markAllRead(req.user!.userId);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

export default router;
