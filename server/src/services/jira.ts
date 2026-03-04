import { prisma } from "../db.js";
import { AppError } from "../middleware/errorHandler.js";

export const jiraService = {
  async saveConfig(orgId: string, data: { accessToken?: string; refreshToken?: string; siteUrl?: string; projectKey?: string }) {
    return prisma.jiraConfig.upsert({
      where: { orgId },
      create: { orgId, ...data },
      update: data,
    });
  },

  async getConfig(orgId: string) {
    return prisma.jiraConfig.findUnique({ where: { orgId } });
  },

  async createTickets(reportId: string, ticketIds: string[]) {
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: { study: true },
    });
    if (!report) throw new AppError(404, "Report not found");

    const jiraConfig = await prisma.jiraConfig.findUnique({
      where: { orgId: report.study.orgId },
    });

    const tickets = await prisma.jiraTicket.findMany({
      where: { id: { in: ticketIds }, reportId },
    });

    // V1 stub: In production, call Jira REST API to create issues.
    const results = tickets.map((ticket) => {
      const mockKey = `${jiraConfig?.projectKey || "PROJ"}-${Math.floor(Math.random() * 9000) + 1000}`;
      return {
        ticketId: ticket.id,
        externalId: mockKey,
        externalUrl: `https://${jiraConfig?.siteUrl || "jira.example.com"}/browse/${mockKey}`,
      };
    });

    for (const result of results) {
      await prisma.jiraTicket.update({
        where: { id: result.ticketId },
        data: {
          status: "created",
          externalId: result.externalId,
          externalUrl: result.externalUrl,
        },
      });
    }

    return results;
  },

  async updateTicketSelection(ticketId: string, selected: boolean) {
    return prisma.jiraTicket.update({
      where: { id: ticketId },
      data: { selected },
    });
  },
};
