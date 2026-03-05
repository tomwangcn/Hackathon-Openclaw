import { Router } from "express";
import { authenticate, requireRole } from "../middleware/auth.js";
import { identityService } from "../services/identity.js";
import { studyService } from "../services/study.js";
import type { AuthRequest } from "../types.js";

const router = Router();
router.use(authenticate);
router.use(requireRole("business"));

router.get("/", async (req: AuthRequest, res, next) => {
  try {
    const membership = await identityService.getUserOrg(req.user!.userId);
    if (!membership) { res.status(400).json({ error: "No organization" }); return; }
    const studies = await studyService.listByOrg(membership.orgId);
    res.json(studies);
  } catch (err) { next(err); }
});

router.post("/", async (req: AuthRequest, res, next) => {
  try {
    const membership = await identityService.getUserOrg(req.user!.userId);
    if (!membership) { res.status(400).json({ error: "No organization" }); return; }
    const study = await studyService.create(membership.orgId, req.body);
    res.status(201).json(study);
  } catch (err) { next(err); }
});

router.get("/:id", async (req: AuthRequest, res, next) => {
  try {
    const study = await studyService.get(req.params.id);
    const membership = await identityService.getUserOrg(req.user!.userId);
    if (study.orgId !== membership?.orgId) { res.status(403).json({ error: "Not your study" }); return; }
    res.json(study);
  } catch (err) { next(err); }
});

router.patch("/:id", async (req: AuthRequest, res, next) => {
  try {
    const membership = await identityService.getUserOrg(req.user!.userId);
    if (!membership) { res.status(400).json({ error: "No organization" }); return; }
    const study = await studyService.update(req.params.id, membership.orgId, req.body);
    res.json(study);
  } catch (err) { next(err); }
});

router.post("/:id/publish", async (req: AuthRequest, res, next) => {
  try {
    const membership = await identityService.getUserOrg(req.user!.userId);
    if (!membership) { res.status(400).json({ error: "No organization" }); return; }
    const study = await studyService.publish(req.params.id, membership.orgId);
    res.json(study);
  } catch (err) { next(err); }
});

router.post("/:id/tasks", async (req: AuthRequest, res, next) => {
  try {
    const task = await studyService.addTask(req.params.id, req.body);
    res.status(201).json(task);
  } catch (err) { next(err); }
});

router.patch("/tasks/:taskId", async (req: AuthRequest, res, next) => {
  try {
    const task = await studyService.updateTask(req.params.taskId, req.body);
    res.json(task);
  } catch (err) { next(err); }
});

router.delete("/tasks/:taskId", async (req: AuthRequest, res, next) => {
  try {
    await studyService.deleteTask(req.params.taskId);
    res.status(204).end();
  } catch (err) { next(err); }
});

export default router;
