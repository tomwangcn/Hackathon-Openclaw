import { Router } from "express";
import { identityService } from "../services/identity.js";
import { authenticate } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { prisma } from "../db.js";
import type { AuthRequest } from "../types.js";

const router = Router();

router.post("/register", authLimiter, async (req, res, next) => {
  try {
    const { email, password, name, role, orgName } = req.body;
    if (!email || !password || !name || !role) {
      res.status(400).json({ error: "email, password, name, and role are required" });
      return;
    }
    if (!["business", "tester"].includes(role)) {
      res.status(400).json({ error: "role must be 'business' or 'tester'" });
      return;
    }
    if (role === "business" && !orgName) {
      res.status(400).json({ error: "orgName is required for business users" });
      return;
    }

    const result = await identityService.register({ email, password, name, role, orgName });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

router.post("/login", authLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "email and password are required" });
      return;
    }

    const result = await identityService.login(email, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/me", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await identityService.getUser(req.user!.userId);
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/onboard — save ND profile
router.post("/onboard", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { ndCategories, diagnosticStatus, assistiveTech, devices } = req.body;
    const userId = req.user!.userId;

    await prisma.testerProfile.upsert({
      where: { userId },
      update: {
        ndCategories: JSON.stringify(ndCategories || []),
        diagnosticStatus: diagnosticStatus || null,
        assistiveTech: JSON.stringify(assistiveTech || []),
        devices: JSON.stringify(devices || []),
      },
      create: {
        userId,
        ndCategories: JSON.stringify(ndCategories || []),
        diagnosticStatus: diagnosticStatus || null,
        assistiveTech: JSON.stringify(assistiveTech || []),
        devices: JSON.stringify(devices || []),
      },
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
