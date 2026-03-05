import type { Response } from "express";
import { prisma } from "../db.js";

const sseClients = new Map<string, Set<Response>>();

export const notificationService = {
  async create(data: {
    userId: string;
    type: string;
    title: string;
    body?: string;
    channel?: string;
    data?: string;
  }) {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        body: data.body,
        channel: data.channel ?? "web",
        data: data.data,
      },
    });

    this.pushSSE(data.userId, notification);
    return notification;
  },

  async getByUser(userId: string, unreadOnly = false) {
    return prisma.notification.findMany({
      where: { userId, ...(unreadOnly ? { read: false } : {}) },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  },

  async markRead(notificationId: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { read: true },
    });
  },

  async markAllRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  },

  registerSSE(userId: string, res: Response) {
    if (!sseClients.has(userId)) {
      sseClients.set(userId, new Set());
    }
    sseClients.get(userId)!.add(res);

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    res.write("data: {\"type\":\"connected\"}\n\n");

    res.on("close", () => {
      sseClients.get(userId)?.delete(res);
      if (sseClients.get(userId)?.size === 0) {
        sseClients.delete(userId);
      }
    });
  },

  pushSSE(userId: string, data: unknown) {
    const clients = sseClients.get(userId);
    if (!clients) return;

    const payload = `data: ${JSON.stringify(data)}\n\n`;
    for (const res of clients) {
      res.write(payload);
    }
  },
};
