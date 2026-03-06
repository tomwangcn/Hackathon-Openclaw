import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

export const config = {
  port: parseInt(process.env.PORT || "3001", 10),
  jwtSecret: process.env.JWT_SECRET || "change-me",
  uploadDir: path.resolve(__dirname, "..", process.env.UPLOAD_DIR || "../uploads"),
  databaseUrl: process.env.DATABASE_URL || "file:./dev.db",

  s3: {
    endpoint: process.env.S3_ENDPOINT,
    bucket: process.env.S3_BUCKET,
    accessKey: process.env.S3_ACCESS_KEY,
    secretKey: process.env.S3_SECRET_KEY,
  },

  jira: {
    clientId: process.env.JIRA_CLIENT_ID,
    clientSecret: process.env.JIRA_CLIENT_SECRET,
  },

  redis: {
    url: process.env.REDIS_URL,
  },

  openclaw: {
    gatewayUrl: process.env.OPENCLAW_GATEWAY_URL,
    hooksToken: process.env.OPENCLAW_HOOKS_TOKEN,
    model: process.env.OPENCLAW_MODEL,
  },

  flock: {
    apiKey: process.env.FLOCK_API_KEY,
    apiUrl: process.env.FLOCK_API_URL || "https://api.flock.io",
  },

  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    webhookUrl: process.env.TELEGRAM_WEBHOOK_URL,
    botUsername: process.env.TELEGRAM_BOT_USERNAME,
  },

  appUrl: process.env.APP_URL || "http://localhost:5173",
} as const;
