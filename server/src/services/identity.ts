import bcrypt from "bcryptjs";
import { prisma } from "../db.js";
import { signToken } from "../middleware/auth.js";
import { AppError } from "../middleware/errorHandler.js";
import type { AuthPayload, UserRole, OrgRole } from "../types.js";

export const identityService = {
  async register(data: {
    email: string;
    password: string;
    name: string;
    role: UserRole;
    orgName?: string;
  }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new AppError(409, "Email already registered");

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        role: data.role,
      },
    });

    if (data.role === "business" && data.orgName) {
      const org = await prisma.organization.create({ data: { name: data.orgName } });
      await prisma.orgMembership.create({
        data: { userId: user.id, orgId: org.id, role: "admin" },
      });
    }

    if (data.role === "tester") {
      await prisma.testerProfile.create({ data: { userId: user.id } });
    }

    const payload: AuthPayload = { userId: user.id, role: data.role as "business" | "tester", email: user.email };
    return { user: { id: user.id, email: user.email, name: user.name, role: user.role }, token: signToken(payload) };
  },

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError(401, "Invalid credentials");

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new AppError(401, "Invalid credentials");

    const payload: AuthPayload = { userId: user.id, role: user.role as "business" | "tester", email: user.email };
    return { user: { id: user.id, email: user.email, name: user.name, role: user.role }, token: signToken(payload) };
  },

  async getUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        orgMemberships: { include: { org: true } },
        testerProfile: true,
      },
    });
    if (!user) throw new AppError(404, "User not found");

    const { passwordHash: _, ...safe } = user;
    return safe;
  },

  async getUserOrg(userId: string) {
    const membership = await prisma.orgMembership.findFirst({
      where: { userId },
      include: { org: true },
    });
    return membership;
  },

  async checkOrgAccess(userId: string, orgId: string): Promise<OrgRole> {
    const membership = await prisma.orgMembership.findUnique({
      where: { userId_orgId: { userId, orgId } },
    });
    if (!membership) throw new AppError(403, "No access to this organization");
    return membership.role as OrgRole;
  },
};
