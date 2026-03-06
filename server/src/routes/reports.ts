import { Router } from "express";
import { authenticate, requireRole } from "../middleware/auth.js";
import { reportService } from "../services/report.js";
import { jiraService } from "../services/jira.js";
import type { AuthRequest } from "../types.js";

const router = Router();
router.use(authenticate);

// GET endpoints accessible by both testers and business
router.get("/study/:studyId", async (req: AuthRequest, res, next) => {
  try {
    const reports = await reportService.listByStudy(req.params.studyId);
    res.json(reports);
  } catch (err) { next(err); }
});

router.get("/:id", async (req: AuthRequest, res, next) => {
  try {
    const report = await reportService.get(req.params.id);
    res.json(report);
  } catch (err) { next(err); }
});

router.post("/generate/:studyId", requireRole("business"), async (req: AuthRequest, res, next) => {
  try {
    const report = await reportService.generate(req.params.studyId);
    res.status(201).json(report);
  } catch (err) { next(err); }
});

router.patch("/tickets/:ticketId/select", requireRole("business"), async (req: AuthRequest, res, next) => {
  try {
    const { selected } = req.body;
    const ticket = await jiraService.updateTicketSelection(req.params.ticketId, selected);
    res.json(ticket);
  } catch (err) { next(err); }
});

router.post("/:id/tickets/create-jira", requireRole("business"), async (req: AuthRequest, res, next) => {
  try {
    const { ticketIds } = req.body;
    if (!Array.isArray(ticketIds)) { res.status(400).json({ error: "ticketIds must be an array" }); return; }
    const results = await jiraService.createTickets(req.params.id, ticketIds);
    res.json(results);
  } catch (err) { next(err); }
});

export default router;
