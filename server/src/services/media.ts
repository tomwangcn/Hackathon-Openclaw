import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { prisma } from "../db.js";
import { config } from "../config.js";
import { AppError } from "../middleware/errorHandler.js";

export const mediaService = {
  async generateUploadUrl(sessionId: string, type: string, filename: string) {
    const session = await prisma.session.findUnique({ where: { id: sessionId } });
    if (!session) throw new AppError(404, "Session not found");

    const ext = path.extname(filename);
    const storageName = `${sessionId}/${type}/${crypto.randomUUID()}${ext}`;
    const storagePath = path.join(config.uploadDir, storageName);

    await fs.mkdir(path.dirname(storagePath), { recursive: true });

    // V1: return a local upload endpoint. In production, return a pre-signed S3 URL.
    const uploadToken = crypto.randomBytes(16).toString("hex");
    return {
      uploadUrl: `/api/media/upload/${uploadToken}`,
      storagePath: storageName,
      uploadToken,
      _meta: { sessionId, type, filename, storagePath: storageName },
    };
  },

  async registerArtifact(data: {
    sessionId: string;
    type: string;
    filename: string;
    mimeType?: string;
    sizeBytes?: number;
    storagePath: string;
  }) {
    return prisma.artifact.create({ data });
  },

  async getArtifacts(sessionId: string) {
    return prisma.artifact.findMany({
      where: { sessionId },
      orderBy: { uploadedAt: "asc" },
    });
  },

  async getSignedDownloadUrl(artifactId: string) {
    const artifact = await prisma.artifact.findUnique({ where: { id: artifactId } });
    if (!artifact) throw new AppError(404, "Artifact not found");

    // V1: return local file path. In production, return a pre-signed S3 URL.
    return {
      url: `/api/media/download/${artifact.id}`,
      filename: artifact.filename,
      mimeType: artifact.mimeType,
    };
  },

  getLocalPath(storagePath: string) {
    return path.join(config.uploadDir, storagePath);
  },
};
