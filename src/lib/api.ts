const BASE = "/api";

function getToken(): string | null {
  return localStorage.getItem("token");
}

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...opts, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ user: { id: string; email: string; name: string; role: string }; token: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    register: (data: { email: string; password: string; name: string; role: string; orgName?: string }) =>
      request<{ user: { id: string; email: string; name: string; role: string }; token: string }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    me: () => request<any>("/auth/me"),
  },

  studies: {
    list: () => request<any[]>("/studies"),
    get: (id: string) => request<any>(`/studies/${id}`),
    create: (data: any) => request<any>("/studies", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/studies/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    publish: (id: string) => request<any>(`/studies/${id}/publish`, { method: "POST" }),
    addTask: (studyId: string, data: any) =>
      request<any>(`/studies/${studyId}/tasks`, { method: "POST", body: JSON.stringify(data) }),
  },

  sessions: {
    mine: () => request<any[]>("/sessions/mine"),
    get: (id: string) => request<any>(`/sessions/${id}`),
    byStudy: (studyId: string) => request<any[]>(`/sessions/study/${studyId}`),
    start: (id: string) => request<any>(`/sessions/${id}/start`, { method: "POST" }),
    end: (id: string) => request<any>(`/sessions/${id}/end`, { method: "POST" }),
    updateTask: (sessionId: string, taskId: string, completed: boolean) =>
      request<any>(`/sessions/${sessionId}/tasks/${taskId}`, {
        method: "PATCH",
        body: JSON.stringify({ completed }),
      }),
  },

  marketplace: {
    list: (filters?: Record<string, string>) => {
      const params = filters ? new URLSearchParams(filters).toString() : "";
      return request<any[]>(`/marketplace${params ? `?${params}` : ""}`);
    },
    accept: (studyId: string) =>
      request<any>(`/marketplace/${studyId}/accept`, { method: "POST" }),
    withdraw: (studyId: string) =>
      request<any>(`/marketplace/${studyId}/withdraw`, { method: "POST" }),
  },

  conversations: {
    findOrCreate: (studyId: string, agentType: string) =>
      request<any>("/conversations/find-or-create", {
        method: "POST",
        body: JSON.stringify({ studyId, agentType }),
      }),
    get: (id: string) => request<any>(`/conversations/${id}`),
    addMessage: (id: string, content: string) =>
      request<any>(`/conversations/${id}/messages`, {
        method: "POST",
        body: JSON.stringify({ role: "user", content }),
      }),
  },

  reports: {
    byStudy: (studyId: string) => request<any[]>(`/reports/study/${studyId}`),
    get: (id: string) => request<any>(`/reports/${id}`),
    generate: (studyId: string) =>
      request<any>(`/reports/generate/${studyId}`, { method: "POST" }),
  },

  notifications: {
    list: () => request<any[]>("/notifications"),
    markRead: (id: string) =>
      request<any>(`/notifications/${id}/read`, { method: "PATCH" }),
  },

  emotions: {
    analyze: (sessionId: string, imageBase64: string) =>
      request<any>(`/emotions/${sessionId}/analyze`, {
        method: "POST",
        body: JSON.stringify({ image: imageBase64, timestamp: new Date().toISOString() }),
      }),
    timeline: (sessionId: string) => request<any[]>(`/emotions/${sessionId}/timeline`),
    summary: (sessionId: string) => request<any>(`/emotions/${sessionId}/summary`),
    finalize: (sessionId: string) =>
      request<any>(`/emotions/${sessionId}/finalize`, { method: "POST" }),
  },

  agents: {
    studyDesigner: (message: string, studyId?: string) =>
      request<any>("/agents/study-designer", {
        method: "POST",
        body: JSON.stringify({ message, studyId }),
      }),
    facilitator: (data: {
      sessionId: string;
      message?: string;
      currentTask?: { title: string; description: string } | null;
      timeOnTaskSeconds?: number;
      completedTasks?: number;
      totalTasks?: number;
    }) =>
      request<any>("/agents/facilitator", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    report: (studyId: string) =>
      request<any>("/agents/report", {
        method: "POST",
        body: JSON.stringify({ studyId }),
      }),
  },

  interactions: {
    sendBatch: (sessionId: string, events: any[]) =>
      request<any>(`/interactions/${sessionId}/batch`, {
        method: "POST",
        body: JSON.stringify({ events }),
      }),
    timeline: (sessionId: string) => request<any[]>(`/interactions/${sessionId}/timeline`),
    summary: (sessionId: string) => request<any>(`/interactions/${sessionId}/summary`),
    finalize: (sessionId: string) =>
      request<any>(`/interactions/${sessionId}/finalize`, { method: "POST" }),
  },
};
