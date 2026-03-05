import { chatCompletion } from "../services/llm.js";
import { agentToolsService } from "../services/agentTools.js";
import { conversationService } from "../services/conversation.js";

const SYSTEM_PROMPT = `You are the Study Designer Agent for OpenClaw, an accessibility testing platform. Your job is to help business users turn their goals into a well-structured usability study.

You have deep expertise in:
- WCAG 2.2 (A, AA, AAA) guidelines
- Cognitive accessibility (ADHD, dyslexia, autism considerations)
- UX research methodology (task design, success criteria, bias avoidance)
- Accessibility testing best practices

When the user describes what they want to test, you should:
1. Ask clarifying questions if the request is ambiguous (max 2-3 at a time)
2. Suggest specific, measurable tasks with clear success criteria
3. Recommend focus areas and capture settings based on their goals
4. Flag potential issues (tasks too broad, missing edge cases, leading instructions)

When you have enough context, respond with a JSON "study patch" that the UI can apply. The patch format is:
{
  "type": "patch",
  "tasks": [
    { "title": "...", "description": "...", "successCriteria": "..." }
  ],
  "config": {
    "focusAreas": ["..."],
    "wcagLevel": "AA",
    "estimatedTime": "20 min",
    "captureWebcam": true/false
  },
  "explanation": "Brief explanation of why you structured the study this way"
}

When asking questions, respond with:
{
  "type": "questions",
  "questions": ["question1", "question2"],
  "explanation": "Why you need these answers"
}

When giving general advice or responding to conversation, respond with:
{
  "type": "message",
  "content": "Your message here"
}

Always respond in valid JSON with one of the above types.
Keep suggestions practical and specific. Avoid generic advice.`;

export async function runStudyDesigner(
  conversationId: string,
  userMessage: string,
  studyId?: string
) {
  let studyContext = "";
  if (studyId) {
    try {
      const study = await agentToolsService.getStudyContext(studyId);
      studyContext = `\n\nCurrent study state:\n- Name: ${study.name}\n- Status: ${study.status}\n- Goal: ${study.goal || "Not set"}\n- Target URLs: ${study.targetUrls || "None"}\n- Tasks: ${JSON.stringify(study.tasks.map((t: any) => ({ title: t.title, description: t.description, successCriteria: t.successCriteria })))}\n- Focus Areas: ${study.focusAreas || "None"}\n- WCAG Level: ${study.wcagLevel || "Not set"}`;
    } catch {}
  }

  await conversationService.addMessage({
    conversationId,
    role: "user",
    content: userMessage,
  });

  const history = await conversationService.getContextWindow(conversationId, 20);

  const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: SYSTEM_PROMPT + studyContext },
    ...history.map((m: any) => ({
      role: (m.role === "agent" ? "assistant" : m.role) as "system" | "user" | "assistant",
      content: m.content,
    })),
  ];

  const response = await chatCompletion(messages, { jsonMode: true, temperature: 0.6 });

  await conversationService.addMessage({
    conversationId,
    role: "agent",
    content: response,
  });

  try {
    return JSON.parse(response);
  } catch {
    return { type: "message", content: response };
  }
}
