import { useState, useRef, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { api } from "@/lib/api"
import {
  Monitor,
  Mic,
  Camera,
  CameraOff,
  Play,
  Pause,
  Bot,
  Send,
  Check,
  Clock,
  ChevronDown,
  ChevronUp,
  Volume2,
  VolumeX,
  Sun,
  User,
  CircleDot,
  X,
  Loader2,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/Logo"

interface Task {
  id: string
  name: string
  done: boolean
}

interface ChatMessage {
  id: number
  sender: "agent" | "user"
  text: string
  time: string
}

const EMOTION_EMOJI: Record<string, string> = {
  happy: "😊",
  sad: "😢",
  angry: "😠",
  surprise: "😲",
  fear: "😨",
  disgust: "🤢",
  neutral: "😐",
}

const INITIAL_CHAT: ChatMessage[] = [
  {
    id: 1,
    sender: "agent",
    text: "Hi! I'm the Latch Guide, your AI companion for this session. I'll help you through each task and note any observations. Take your time — there are no wrong answers here.",
    time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
  },
]

export default function LiveSession() {
  const navigate = useNavigate()
  const { id: sessionId } = useParams<{ id: string }>()
  const [studyName, setStudyName] = useState("Loading...")
  const [targetUrl, setTargetUrl] = useState<string | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [chat, setChat] = useState(INITIAL_CHAT)
  const [chatInput, setChatInput] = useState("")
  const [taskPanelOpen, setTaskPanelOpen] = useState(true)
  const [cameraOn, setCameraOn] = useState(true)
  const [agentMuted, setAgentMuted] = useState(false)
  const [recording, setRecording] = useState<"idle" | "recording" | "paused">("recording")
  const [elapsed, setElapsed] = useState(0)
  const [loading, setLoading] = useState(true)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [currentEmotion, setCurrentEmotion] = useState<{ dominant: string; emotions: Record<string, number> } | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const completedCount = tasks.filter((t) => t.done).length
  const currentTask = tasks.find((t) => !t.done)

  useEffect(() => {
    if (!sessionId) return
    setLoading(true)
    api.sessions.get(sessionId)
      .then((session) => {
        setStudyName(session.study?.name || "Untitled Study")
        const urls = session.study?.targetUrls ? JSON.parse(session.study.targetUrls) : []
        if (urls.length > 0) setTargetUrl(urls[0])

        const studyTasks = session.study?.tasks || []
        const results = session.taskResults || []
        setTasks(studyTasks.map((t: any) => ({
          id: t.id,
          name: t.title,
          done: results.some((r: any) => r.taskId === t.id && r.completed),
        })))

        setChat([{
          id: 1,
          sender: "agent",
          text: `Hi! I'm the Latch Guide for "${session.study?.name}". I'll help you through each task. You have ${studyTasks.length} tasks to complete. Take your time — there are no wrong answers.`,
          time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
        }])
      })
      .catch(() => {
        setStudyName("Session")
        setTargetUrl("https://www.nhs.uk")
        setTasks([
          { id: "1", name: "Navigate to the Health A-Z page", done: false },
          { id: "2", name: "Search for a condition", done: false },
          { id: "3", name: "Find GP services near you", done: false },
        ])
      })
      .finally(() => setLoading(false))
  }, [sessionId])

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then((mediaStream) => {
        setStream(mediaStream)
        setCameraOn(true)
      })
      .catch(() => {
        setCameraOn(false)
      })
    return () => {
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream, cameraOn])

  useEffect(() => {
    if (!sessionId || !stream || !cameraOn || recording !== "recording") return
    let active = true

    const captureAndAnalyze = async () => {
      if (!active || !videoRef.current || !canvasRef.current) return
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = 320
      canvas.height = 240
      const ctx = canvas.getContext("2d")
      if (!ctx) return
      ctx.drawImage(video, 0, 0, 320, 240)
      const imageBase64 = canvas.toDataURL("image/jpeg", 0.7)

      try {
        const result = await api.emotions.analyze(sessionId, imageBase64)
        if (active && result.dominant_emotion && result.dominant_emotion !== "unknown") {
          setCurrentEmotion({ dominant: result.dominant_emotion, emotions: result.emotions })
        }
      } catch {}
    }

    captureAndAnalyze()
    const interval = setInterval(captureAndAnalyze, 3000)
    return () => { active = false; clearInterval(interval) }
  }, [sessionId, stream, cameraOn, recording])

  useEffect(() => {
    if (recording !== "recording") return
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(interval)
  }, [recording])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chat])

  function formatTime(secs: number) {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  function markComplete(taskId: string) {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, done: true } : t)))
    if (sessionId) {
      api.sessions.updateTask(sessionId, taskId, true).catch(() => {})
    }
  }

  function sendChat() {
    if (!chatInput.trim()) return
    setChat((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: "user",
        text: chatInput.trim(),
        time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      },
    ])
    setChatInput("")
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[var(--color-background)] overflow-hidden">
      <canvas ref={canvasRef} className="hidden" />
      {/* ═══════════════════ TOP BAR ═══════════════════ */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4">
        <div className="flex items-center gap-4">
          <Logo size="sm" />
          <Separator orientation="vertical" className="h-5" />
          <span className="text-sm font-medium text-[var(--color-text-primary)] truncate max-w-[260px]">
            {studyName}
          </span>
        </div>

        <div className="flex items-center gap-5">
          {/* Task progress */}
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
            <span className="font-medium text-[var(--color-text-primary)]">{completedCount}/{tasks.length}</span>
            tasks
          </div>

          {/* Recording indicators */}
          <div className="flex items-center gap-3">
            {[
              { icon: Monitor, label: "Screen", active: true },
              { icon: Mic, label: "Audio", active: true },
              { icon: Camera, label: "Webcam", active: cameraOn },
            ].map((r) => (
              <div key={r.label} className="flex items-center gap-1.5 text-xs">
                {r.active && (
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-danger)] opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-danger)]" />
                  </span>
                )}
                <r.icon className={cn("h-3.5 w-3.5", r.active ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-muted)]")} />
                <span className={r.active ? "text-[var(--color-text-secondary)]" : "text-[var(--color-text-muted)]"}>
                  {r.label}
                </span>
              </div>
            ))}
          </div>

          {/* Timer */}
          <div className="flex items-center gap-1.5 font-mono text-sm text-[var(--color-text-primary)]">
            <Clock className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
            {formatTime(elapsed)}
          </div>

          {/* Pause / Resume */}
          {recording === "recording" && (
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => setRecording("paused")}>
              <Pause className="h-3 w-3" />
              Pause
            </Button>
          )}
          {recording === "paused" && (
            <Button size="sm" className="h-7 text-xs gap-1" onClick={() => setRecording("recording")}>
              <Play className="h-3 w-3" />
              Resume
            </Button>
          )}

          {/* End Session */}
          <Button variant="destructive" size="sm" className="h-7 text-xs gap-1" onClick={async () => {
            if (sessionId) {
              await api.emotions.finalize(sessionId).catch(() => {})
            }
            stream?.getTracks().forEach((t) => t.stop())
            navigate("/tester/dashboard")
          }}>
            <X className="h-3 w-3" />
            End Session
          </Button>
        </div>
      </header>

      {/* ═══════════════════ MAIN CONTENT ═══════════════════ */}
      <div className="flex flex-1 overflow-hidden">
        {/* ─── LEFT: Website Preview (larger) ─── */}
        <div className="relative flex flex-1 border-r border-[var(--color-border)]">
          <div className="relative flex-1 m-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] overflow-hidden bg-white">
            {loading ? (
              <div className="flex h-full items-center justify-center bg-[var(--color-surface)]/30">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 text-[var(--color-accent)] mx-auto mb-3 animate-spin" />
                  <p className="text-sm text-[var(--color-text-muted)]">Loading session...</p>
                </div>
              </div>
            ) : targetUrl ? (
              <iframe
                src={`/api/proxy?url=${encodeURIComponent(targetUrl)}`}
                title="Test website"
                className="h-full w-full border-0"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-[var(--color-surface)]/30">
                <div className="text-center">
                  <Monitor className="h-12 w-12 text-[var(--color-text-muted)]/40 mx-auto mb-3" />
                  <p className="text-sm text-[var(--color-text-muted)] font-medium">No target URL configured</p>
                  <p className="text-xs text-[var(--color-text-muted)]/60 mt-1">The study owner hasn't set a URL yet</p>
                </div>
              </div>
            )}

            {targetUrl && !loading && (
              <div className="absolute top-2 left-2 z-10">
                <a
                  href={targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-full bg-[var(--color-surface)]/90 backdrop-blur-sm border border-[var(--color-border)] px-3 py-1 text-[10px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  <ExternalLink className="h-2.5 w-2.5" />
                  {targetUrl.replace(/^https?:\/\//, "")}
                </a>
              </div>
            )}

            {/* Webcam PiP overlay */}
            <div className="absolute bottom-4 right-4 z-10">
              <div className={cn(
                "w-[240px] rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden",
                cameraOn ? "bg-[var(--color-surface)]" : "bg-[var(--color-background)]"
              )}>
                <div className={cn(
                  "h-[160px] flex items-center justify-center overflow-hidden",
                  cameraOn ? "bg-black" : "bg-[var(--color-background)]"
                )}>
                  {cameraOn && stream ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="h-full w-full object-cover mirror"
                      style={{ transform: "scaleX(-1)" }}
                    />
                  ) : (
                    <div className="text-center">
                      <CameraOff className="h-6 w-6 text-[var(--color-text-muted)]/40 mx-auto mb-1" />
                      <p className="text-[10px] text-[var(--color-text-muted)]">
                        {stream ? "Camera off" : "No camera access"}
                      </p>
                    </div>
                  )}
                </div>
                <div className="px-2.5 py-1.5 border-t border-[var(--color-border)] bg-[var(--color-surface-elevated)]/80 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px]">
                    {currentEmotion ? (
                      <span className="flex items-center gap-1">
                        <span>{EMOTION_EMOJI[currentEmotion.dominant] || "😐"}</span>
                        <span className="text-[var(--color-text-secondary)] capitalize">{currentEmotion.dominant}</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Sun className="h-2.5 w-2.5 text-[var(--color-success)]" />
                        <span className="text-[var(--color-text-muted)]">Analyzing...</span>
                      </span>
                    )}
                    {recording === "recording" && (
                      <Badge variant="destructive" className="text-[8px] h-3.5 gap-0.5 px-1 animate-pulse">
                        <CircleDot className="h-1.5 w-1.5" />
                        REC
                      </Badge>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      if (stream) {
                        stream.getVideoTracks().forEach((t) => { t.enabled = cameraOn ? false : true })
                        setCameraOn(!cameraOn)
                      }
                    }}
                    className="text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
                  >
                    {cameraOn ? <Camera className="h-3 w-3" /> : <CameraOff className="h-3 w-3" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── RIGHT REGION (380px) ─── */}
        <div className="flex w-[380px] shrink-0 flex-col">
          {/* Latch Guide Chat */}
          <div className="flex flex-1 flex-col min-h-0">
            <div className="flex items-center justify-between shrink-0 border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-2.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-accent)]/10">
                  <Bot className="h-4 w-4 text-[var(--color-accent)]" />
                </div>
                <div>
                  <p className="text-sm font-semibold font-display text-[var(--color-text-primary)] leading-tight">Latch Guide</p>
                  <p className="text-[10px] text-[var(--color-text-muted)]">Flock AI</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAgentMuted(!agentMuted)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs transition-colors",
                    agentMuted
                      ? "bg-[var(--color-danger)]/10 text-[var(--color-danger)]"
                      : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
                  )}
                >
                  {agentMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                  {agentMuted ? "Muted" : "Mute"}
                </button>
              </div>
            </div>

            <ScrollArea className="flex-1 min-h-0">
              <div className="p-4 space-y-3">
                {chat.map((msg) => (
                  <div key={msg.id} className={cn("flex gap-2.5", msg.sender === "user" && "flex-row-reverse")}>
                    {msg.sender === "agent" && (
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)]/10 mt-0.5">
                        <Bot className="h-3 w-3 text-[var(--color-accent)]" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[85%] rounded-[var(--radius-md)] px-3 py-2 text-sm leading-relaxed",
                        msg.sender === "agent"
                          ? "bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)]"
                          : "bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                      )}
                    >
                      {msg.text}
                      <span className={cn(
                        "block text-[10px] mt-1",
                        msg.sender === "agent" ? "text-[var(--color-text-muted)]" : "text-[var(--color-accent)]/50"
                      )}>
                        {msg.time}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </ScrollArea>

            <div className="shrink-0 border-t border-[var(--color-border)] p-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask the Latch Guide..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendChat()}
                  className="bg-[var(--color-surface-elevated)] text-sm"
                />
                <Button size="icon" className="shrink-0 h-10 w-10" onClick={sendChat}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>

          </div>

          {/* Task Progress (moved below chat) */}
          <div className="shrink-0 border-t border-[var(--color-border)]">
            <button
              className="flex w-full items-center justify-between bg-[var(--color-surface-elevated)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] transition-colors"
              onClick={() => setTaskPanelOpen(!taskPanelOpen)}
            >
              <span className="flex items-center gap-2">
                <CircleDot className="h-4 w-4 text-[var(--color-accent)]" />
                Task Progress — {completedCount}/{tasks.length}
              </span>
              {taskPanelOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </button>

            {taskPanelOpen && (
              <div className="border-t border-[var(--color-border)] bg-[var(--color-surface)] p-3 space-y-1.5 max-h-[240px] overflow-y-auto">
                {tasks.map((task, idx) => {
                  const isCurrent = currentTask?.id === task.id
                  return (
                    <div
                      key={task.id}
                      className={cn(
                        "flex items-center justify-between rounded-[var(--radius-md)] px-3 py-2 text-sm transition-all",
                        isCurrent && "bg-[var(--color-accent)]/[0.08] border border-[var(--color-accent)]/20",
                        task.done && "opacity-60",
                        !isCurrent && !task.done && "hover:bg-[var(--color-surface-hover)]"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={cn(
                            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-bold transition-colors",
                            task.done
                              ? "border-[var(--color-success)] bg-[var(--color-success)] text-white"
                              : isCurrent
                                ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                                : "border-[var(--color-border)] text-[var(--color-text-muted)]"
                          )}
                        >
                          {task.done ? <Check className="h-3 w-3" /> : idx + 1}
                        </div>
                        <span className={cn(
                          task.done && "line-through text-[var(--color-text-muted)]",
                          isCurrent && "text-[var(--color-accent)] font-medium",
                          !task.done && !isCurrent && "text-[var(--color-text-secondary)]"
                        )}>
                          {task.name}
                        </span>
                      </div>
                      {isCurrent && (
                        <Button
                          size="sm"
                          className="h-6 text-xs px-2.5 gap-1"
                          onClick={() => markComplete(task.id)}
                        >
                          <Check className="h-3 w-3" />
                          Done
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}
