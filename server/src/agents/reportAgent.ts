import { chatCompletion } from "../services/llm.js";
import { agentToolsService } from "../services/agentTools.js";
import { emotionService } from "../services/emotion.js";
import { interactionService } from "../services/interaction.js";
import { prisma } from "../db.js";

const SYSTEM_PROMPT = `You are the Report Agent for OpenClaw, an accessibility testing platform. Your job is to synthesize session data (emotions, interactions, task results) into a structured accessibility findings report.

You produce a JSON report with:
{
  "summary": "Executive summary (2-3 sentences)",
  "overallScore": 0-100,
  "findings": [
    {
      "severity": "critical|high|medium|low",
      "title": "Short finding title",
      "description": "What was observed, with evidence",
      "frequency": "How often this occurred across sessions",
      "recommendation": "Specific actionable fix",
      "wcagCriteria": "e.g. 2.4.7 Focus Visible",
      "evidenceAnchors": [
        { "type": "emotion|interaction|task", "description": "What happened", "timestamp": "when" }
      ]
    }
  ],
  "emotionInsights": {
    "summary": "What the emotional data tells us",
    "keyMoments": ["moment1", "moment2"]
  },
  "interactionInsights": {
    "summary": "What the interaction patterns tell us",
    "hotspots": ["hotspot1", "hotspot2"]
  },
  "recommendations": [
    { "priority": "high|medium|low", "action": "What to do", "impact": "Expected improvement" }
  ],
  "tickets": [
    {
      "title": "Jira-style ticket title",
      "description": "Description with acceptance criteria",
      "priority": "critical|high|medium|low",
      "labels": ["accessibility", "ux"],
      "acceptanceCriteria": ["criterion1", "criterion2"]
    }
  ]
}

Base your findings on real data. Do not fabricate evidence.
Tie every finding to specific evidence from the session data.
Prioritize actionable recommendations over theoretical observations.
Group related issues together.`;

export async function runReportAgent(studyId: string) {
  const study = await agentToolsService.getStudyContext(studyId);

  const sessionData = await Promise.all(
    study.sessions.map(async (session: any) => {
      let emotionSummary, interactionSummary;

      try {
        emotionSummary = await emotionService.getEmotionSummary(session.id);
      } catch {
        emotionSummary = null;
      }

      try {
        interactionSummary = await interactionService.getInteractionSummary(session.id);
      } catch {
        interactionSummary = null;
      }

      const events = await prisma.sessionEvent.findMany({
        where: { sessionId: session.id },
        orderBy: { timestamp: "asc" },
        take: 100,
      });

      return {
        sessionId: session.id,
        tester: session.tester?.name || "Anonymous",
        status: session.status,
        taskResults: session.taskResults.map((tr: any) => ({
          taskId: tr.taskId,
          completed: tr.completed,
          timeSpent: tr.timeSpent,
          notes: tr.notes,
        })),
        emotionSummary,
        interactionSummary,
        eventTypes: events.reduce((acc: Record<string, number>, e: any) => {
          acc[e.type] = (acc[e.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      };
    })
  );

  const dataPrompt = `
Study: "${study.name}"
Goal: ${study.goal || "Not specified"}
Target URLs: ${study.targetUrls || "Not specified"}
WCAG Level: ${study.wcagLevel || "Not specified"}
Focus Areas: ${study.focusAreas || "Not specified"}
Tasks: ${JSON.stringify(study.tasks.map((t: any) => ({ title: t.title, description: t.description, successCriteria: t.successCriteria })))}

Session Data (${sessionData.length} sessions):
${JSON.stringify(sessionData, null, 2)}

Generate a comprehensive accessibility report based on the above data.`;

  const response = await chatCompletion(
    [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: dataPrompt },
    ],
    { jsonMode: true, temperature: 0.4, maxTokens: 4096 }
  );

  let parsed;
  try {
    parsed = JSON.parse(response);
  } catch {
    parsed = { summary: response, findings: [], recommendations: [], tickets: [] };
  }

  const report = await agentToolsService.writeReport(studyId, {
    summary: parsed.summary || "Report generated",
    findings: (parsed.findings || []).map((f: any) => ({
      severity: f.severity || "medium",
      title: f.title || "Untitled finding",
      description: f.description,
      frequency: f.frequency,
      confidence: f.confidence,
      evidenceCount: f.evidenceAnchors?.length || 0,
    })),
    tickets: parsed.tickets,
  });

  await prisma.report.update({
    where: { id: report.id },
    data: {
      reportJson: JSON.stringify(parsed),
    },
  });

  return { reportId: report.id, ...parsed };
}
