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

  whatsapp: {
    apiToken: process.env.WHATSAPP_API_TOKEN,
    phoneId: process.env.WHATSAPP_PHONE_ID,
  },

  redis: {
    url: process.env.REDIS_URL,
  },
} as const;
