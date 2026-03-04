import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "./config.js";
import { prisma } from "./db.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { globalLimiter } from "./middleware/rateLimiter.js";
import { initOrchestrator } from "./services/orchestrator.js";

import authRoutes from "./routes/auth.js";
import studyRoutes from "./routes/studies.js";
import sessionRoutes from "./routes/sessions.js";
import marketplaceRoutes from "./routes/marketplace.js";
import conversationRoutes from "./routes/conversations.js";
import reportRoutes from "./routes/reports.js";
import notificationRoutes from "./routes/notifications.js";
import internalToolRoutes from "./routes/internal/tools.js";
import proxyRoutes from "./routes/proxy.js";
import emotionRoutes from "./routes/emotions.js";

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(globalLimiter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/studies", studyRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/marketplace", marketplaceRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/internal/tools", internalToolRoutes);
app.use("/api/proxy", proxyRoutes);
app.use("/api/emotions", emotionRoutes);

app.use(errorHandler);

// Serve the built frontend in production
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, "../../dist");
app.use(express.static(distPath));
app.get("/{*path}", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

async function main() {
  await prisma.$connect();
  console.log("[db] Connected to database");

  initOrchestrator();

  app.listen(config.port, () => {
    console.log(`[server] OpenClaw API running on http://localhost:${config.port}`);
    console.log(`[server] Health check: http://localhost:${config.port}/api/health`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
