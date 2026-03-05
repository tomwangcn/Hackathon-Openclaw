import { Router } from "express";
import { authenticate, requireRole } from "../middleware/auth.js";
import { marketplaceService } from "../services/marketplace.js";
import type { AuthRequest } from "../types.js";

const router = Router();
router.use(authenticate);

router.get("/", async (req: AuthRequest, res, next) => {
  try {
    const { deviceType, language } = req.query as { deviceType?: string; language?: string };
    const studies = await marketplaceService.listPublished({ deviceType, language });
    res.json(studies);
  } catch (err) { next(err); }
});

router.post("/:studyId/accept", requireRole("tester"), async (req: AuthRequest, res, next) => {
  try {
    const result = await marketplaceService.acceptStudy(req.params.studyId, req.user!.userId);
    res.status(201).json(result);
  } catch (err) { next(err); }
});

router.post("/:studyId/withdraw", requireRole("tester"), async (req: AuthRequest, res, next) => {
  try {
    const result = await marketplaceService.withdraw(req.params.studyId, req.user!.userId);
    res.json(result);
  } catch (err) { next(err); }
});

export default router;
