import { prisma } from "../db.js";
import { AppError } from "../middleware/errorHandler.js";
import type { Channel, AgentType } from "../types.js";

export const conversationService = {
  async create(data: {
    studyId?: string;
    sessionId?: string;
    channel?: Channel;
    agentType?: AgentType;
  }) {
    return prisma.conversation.create({
      data: {
        studyId: data.studyId,
        sessionId: data.sessionId,
        channel: data.channel ?? "web",
        agentType: data.agentType,
      },
    });
  },

  async get(conversationId: string) {
    const conv = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
    if (!conv) throw new AppError(404, "Conversation not found");
    return conv;
  },

  async addMessage(data: {
    conversationId: string;
    role: "user" | "agent" | "system";
    content: string;
    senderId?: string;
    idempotencyKey?: string;
  }) {
    if (data.idempotencyKey) {
      const existing = await prisma.message.findUnique({
        where: { idempotencyKey: data.idempotencyKey },
      });
      if (existing) return existing;
    }

    return prisma.message.create({
      data: {
        conversationId: data.conversationId,
        role: data.role,
        content: data.content,
        senderId: data.senderId,
        idempotencyKey: data.idempotencyKey,
      },
    });
  },

  async getContextWindow(conversationId: string, limit = 20) {
    const msgs = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return msgs.reverse();
  },

  async listByStudy(studyId: string) {
    return prisma.conversation.findMany({
      where: { studyId },
      include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } },
      orderBy: { createdAt: "desc" },
    });
  },

  async findOrCreate(studyId: string, agentType: AgentType) {
    const existing = await prisma.conversation.findFirst({
      where: { studyId, agentType },
    });
    if (existing) return existing;
    return this.create({ studyId, agentType });
  },
};
