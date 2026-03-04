import { Router } from "express";
import { requireInternal } from "../../middleware/auth.js";
import { agentToolsService } from "../../services/agentTools.js";

const router = Router();
router.use(requireInternal);

router.get("/org-context/:orgId", async (req, res, next) => {
  try {
    const context = await agentToolsService.getOrgContext(req.params.orgId);
    res.json(context);
  } catch (err) { next(err); }
});

router.get("/study-context/:studyId", async (req, res, next) => {
  try {
    const context = await agentToolsService.getStudyContext(req.params.studyId);
    res.json(context);
  } catch (err) { next(err); }
});

router.get("/session-artifacts/:sessionId", async (req, res, next) => {
  try {
    const context = await agentToolsService.getSessionArtifacts(req.params.sessionId);
    res.json(context);
  } catch (err) { next(err); }
});

router.post("/write-report", async (req, res, next) => {
  try {
    const { studyId, summary, findings, tickets } = req.body;
    const report = await agentToolsService.writeReport(studyId, { summary, findings, tickets });
    res.status(201).json(report);
  } catch (err) { next(err); }
});

router.post("/create-tickets-draft", async (req, res, next) => {
  try {
    const { reportId, tickets } = req.body;
    const result = await agentToolsService.createTicketsDraft(reportId, tickets);
    res.status(201).json(result);
  } catch (err) { next(err); }
});

router.post("/log-facilitator-prompt", async (req, res, next) => {
  try {
    const { sessionId, prompt } = req.body;
    const event = await agentToolsService.logFacilitatorPrompt(sessionId, prompt);
    res.status(201).json(event);
  } catch (err) { next(err); }
});

export default router;
