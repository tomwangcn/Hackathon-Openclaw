import type { Request } from "express";

export interface AuthPayload {
  userId: string;
  role: "business" | "tester";
  email: string;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export type StudyStatus = "draft" | "published" | "active" | "completed";
export type SessionStatus = "not_started" | "in_session" | "uploading" | "processing" | "report_ready" | "completed";
export type Severity = "critical" | "high" | "medium" | "low";
export type OrgRole = "admin" | "member";
export type UserRole = "business" | "tester";
export type Channel = "web" | "whatsapp" | "email";
export type AgentType = "study_designer" | "facilitator" | "report" | "ticket";

export type AppEvent =
  | { type: "STUDY_PUBLISHED"; studyId: string; orgId: string }
  | { type: "SESSION_CREATED"; sessionId: string; studyId: string; testerId: string }
  | { type: "SESSION_STARTED"; sessionId: string }
  | { type: "SESSION_ENDED"; sessionId: string }
  | { type: "UPLOAD_COMPLETE"; sessionId: string; artifactId: string }
  | { type: "PROCESSING_DONE"; sessionId: string }
  | { type: "REPORT_READY"; reportId: string; studyId: string }
  | { type: "TICKETS_CREATED"; reportId: string; ticketIds: string[] };
