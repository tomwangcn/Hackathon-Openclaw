import { chatCompletion } from "../services/llm.js";
import { agentToolsService } from "../services/agentTools.js";
import { conversationService } from "../services/conversation.js";
import { emotionService } from "../services/emotion.js";
import { interactionService } from "../services/interaction.js";

const SYSTEM_PROMPT = `You are the Live Facilitator Agent for OpenClaw. You help testers during live accessibility testing sessions with short, supportive, non-leading prompts.

CRITICAL RULES:
- NEVER lead the tester toward a specific action or answer
- NEVER mention specific UI elements they should click
- Keep suggestions SHORT (1-2 sentences max)
- Be encouraging but not patronizing
- Only intervene when the tester appears stuck or asks for help
- Use neutral language: "What are you trying to do?" not "Click the button on the right"

You receive telemetry about the tester's session (time on task, emotion state, interaction patterns). Use this to gauge when someone is struggling.

Respond in JSON:
{
  "suggestions": [
    {
      "text": "The suggestion shown to the tester",
      "reason": "Internal reason (not shown to tester)",
      "urgency": 0-10
    }
  ]
}

Return 0 suggestions if the tester seems fine. Max 2 suggestions.
urgency: 0 = no need to show, 3 = mild nudge, 7 = they seem stuck, 10 = critical frustration detected.
Only show suggestions with urgency >= 3.`;

interface FacilitatorInput {
  sessionId: string;
  conversationId: string;
  currentTask: { title: string; description: string } | null;
  timeOnTaskSeconds: number;
  userMessage?: string;
  completedTasks: number;
  totalTasks: number;
}

export async function runLiveFacilitator(input: FacilitatorInput) {
  let emotionSummary = "";
  let interactionSummary = "";

  try {
    const emotions = await emotionService.getEmotionSummary(input.sessionId);
    if (emotions.totalSamples > 0) {
      emotionSummary = `\nEmotion data (${emotions.totalSamples} samples): dominant emotions = ${JSON.stringify(emotions.dominantEmotions)}, friction moments = ${emotions.frictionMoments.length}`;
    }
  } catch {}

  try {
    const interactions = await interactionService.getInteractionSummary(input.sessionId);
    if (interactions.totalEvents > 0) {
      interactionSummary = `\nInteraction data: rage clicks = ${interactions.counts["rage_click"] || 0}, freezes = ${interactions.counts["freeze"] || 0}, misclicks = ${interactions.counts["misclick"] || 0}, friction score = ${interactions.frictionScore}/100`;
    }
  } catch {}

  const contextBlock = `
Session telemetry:
- Current task: ${input.currentTask ? `"${input.currentTask.title}" — ${input.currentTask.description}` : "No active task"}
- Time on current task: ${input.timeOnTaskSeconds}s
- Progress: ${input.completedTasks}/${input.totalTasks} tasks completed${emotionSummary}${interactionSummary}`;

  if (input.userMessage) {
    await conversationService.addMessage({
      conversationId: input.conversationId,
      role: "user",
      content: input.userMessage,
    });
  }

  const history = await conversationService.getContextWindow(input.conversationId, 10);

  const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: SYSTEM_PROMPT + contextBlock },
    ...history.map((m: any) => ({
      role: (m.role === "agent" ? "assistant" : m.role) as "system" | "user" | "assistant",
      content: m.content,
    })),
  ];

  if (!input.userMessage) {
    messages.push({
      role: "user",
      content: "[SYSTEM: Tester telemetry update. Evaluate if they need a nudge. If they seem fine, return 0 suggestions.]",
    });
  }

  const response = await chatCompletion(messages, { jsonMode: true, temperature: 0.5, maxTokens: 512 });

  await conversationService.addMessage({
    conversationId: input.conversationId,
    role: "agent",
    content: response,
  });

  await agentToolsService.logFacilitatorPrompt(input.sessionId, response);

  try {
    return JSON.parse(response);
  } catch {
    return { suggestions: [] };
  }
}
