import { useState, useRef, useEffect } from "react"
import {
  Monitor,
  Mic,
  Camera,
  CameraOff,
  Play,
  Pause,
  Square,
  AlertTriangle,
  Bot,
  Send,
  Check,
  Clock,
  ChevronDown,
  ChevronUp,
  Plus,
  Volume2,
  VolumeX,
  Sun,
  User,
  CircleDot,
  Trash2,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/Logo"

interface Task {
  id: number
  name: string
  done: boolean
}

interface ChatMessage {
  id: number
  sender: "agent" | "user"
  text: string
  time: string
}

interface SessionNote {
  id: number
  text: string
  time: string
}

const MOCK_TASKS: Task[] = [
  { id: 1, name: "Navigate to the appointment booking page", done: true },
  { id: 2, name: "Search for a GP in your area using the search bar", done: true },
  { id: 3, name: "Select a time slot and complete the booking form", done: false },
  { id: 4, name: "Attempt to reschedule the appointment", done: false },
  { id: 5, name: "Locate the prescription repeat request section", done: false },
]

const MOCK_CHAT: ChatMessage[] = [
  {
    id: 1,
    sender: "agent",
    text: "Hi! I'm the Latch Guide, your AI companion for this session. I'll help you through each task and note any observations. Take your time — there are no wrong answers here.",
    time: "14:02",
  },
  {
    id: 2,
    sender: "agent",
    text: "Great work completing the first two tasks! You're now on task 3 — selecting a time slot. Whenever you're ready, go ahead.",
    time: "14:08",
  },
  {
    id: 3,
    sender: "user",
    text: "The calendar is hard to read. The dates are really small.",
    time: "14:10",
  },
  {
    id: 4,
    sender: "agent",
    text: "That's a really useful observation — I've noted the small date text in the calendar. You've been on this step for a while — what are you looking for?",
    time: "14:12",
  },
]

const MOCK_NOTES: SessionNote[] = [
  { id: 1, text: "Calendar date picker text too small on 1080p display", time: "14:10" },
  { id: 2, text: "No visible focus indicator on time slot buttons", time: "14:11" },
]

export default function LiveSession() {
  const [tasks, setTasks] = useState(MOCK_TASKS)
  const [chat, setChat] = useState(MOCK_CHAT)
  const [notes, setNotes] = useState(MOCK_NOTES)
  const [chatInput, setChatInput] = useState("")
  const [noteInput, setNoteInput] = useState("")
  const [taskPanelOpen, setTaskPanelOpen] = useState(true)
  const [cameraOn, setCameraOn] = useState(true)
  const [agentMuted, setAgentMuted] = useState(false)
  const [recording, setRecording] = useState<"idle" | "recording" | "paused">("recording")
  const [elapsed, setElapsed] = useState(732) // 12:12 in seconds
  const chatEndRef = useRef<HTMLDivElement>(null)

  const completedCount = tasks.filter((t) => t.done).length
  const currentTask = tasks.find((t) => !t.done)

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

  function markComplete(taskId: number) {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, done: true } : t)))
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

  function addNote() {
    if (!noteInput.trim()) return
    setNotes((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: noteInput.trim(),
        time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      },
    ])
    setNoteInput("")
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[var(--color-background)] overflow-hidden">
      {/* ═══════════════════ TOP BAR ═══════════════════ */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4">
        <div className="flex items-center gap-4">
          <Logo size="sm" />
          <Separator orientation="vertical" className="h-5" />
          <span className="text-sm font-medium text-[var(--color-text-primary)] truncate max-w-[260px]">
            NHS Digital Portal Navigation Audit
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

          {/* End Session */}
          <Button variant="destructive" size="sm" className="h-7 text-xs gap-1">
            <X className="h-3 w-3" />
            End Session
          </Button>
        </div>
      </header>

      {/* ═══════════════════ MAIN CONTENT ═══════════════════ */}
      <div className="flex flex-1 overflow-hidden">
        {/* ─── LEFT REGION (60%) ─── */}
        <div className="flex w-[60%] flex-col border-r border-[var(--color-border)]">
          {/* Website Preview */}
          <div className="relative flex-1 m-3 mb-0 rounded-[var(--radius-lg)] border-2 border-dashed border-[var(--color-border)] flex items-center justify-center bg-[var(--color-surface)]/30 overflow-hidden">
            <div className="text-center">
              <Monitor className="h-12 w-12 text-[var(--color-text-muted)]/40 mx-auto mb-3" />
              <p className="text-sm text-[var(--color-text-muted)] font-medium">Website preview area</p>
              <p className="text-xs text-[var(--color-text-muted)]/60 mt-1">nhs.uk/appointments</p>
            </div>

            {/* Decorative cursor trail dots */}
            <div className="absolute bottom-16 left-1/3 flex gap-2 opacity-20 pointer-events-none">
              {[6, 5, 4, 3, 2].map((size, i) => (
                <div
                  key={i}
                  className="rounded-full bg-[var(--color-accent)]"
                  style={{ width: size, height: size, opacity: 0.3 + i * 0.15 }}
                />
              ))}
            </div>
          </div>

          {/* Collapsible Task Panel */}
          <div className="shrink-0 m-3 mt-2">
            <button
              className="flex w-full items-center justify-between rounded-t-[var(--radius-md)] bg-[var(--color-surface-elevated)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] transition-colors"
              onClick={() => setTaskPanelOpen(!taskPanelOpen)}
            >
              <span className="flex items-center gap-2">
                <CircleDot className="h-4 w-4 text-[var(--color-accent)]" />
                Task Progress — {completedCount}/{tasks.length}
              </span>
              {taskPanelOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </button>

            {taskPanelOpen && (
              <div className="rounded-b-[var(--radius-md)] border border-t-0 border-[var(--color-border)] bg-[var(--color-surface)] p-3 space-y-1.5">
                {tasks.map((task) => {
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
                          {task.done ? <Check className="h-3 w-3" /> : task.id}
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
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* ─── RIGHT REGION (40%) ─── */}
        <div className="flex w-[40%] flex-col">
          {/* ─── RIGHT-TOP: Latch Guide Chat ─── */}
          <div className="flex flex-1 flex-col border-b border-[var(--color-border)] min-h-0">
            {/* Chat Header */}
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

            {/* Chat Messages */}
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

            {/* Chat Input */}
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

            {/* Session Notes */}
            <div className="shrink-0 border-t border-[var(--color-border)] bg-[var(--color-surface)]/50">
              <div className="px-4 py-2 flex items-center justify-between">
                <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Session Notes</p>
                <Badge variant="secondary" className="text-[10px] h-4">{notes.length}</Badge>
              </div>
              <div className="px-4 pb-2 space-y-1.5 max-h-28 overflow-y-auto">
                {notes.map((note) => (
                  <div key={note.id} className="flex items-start gap-2 text-xs">
                    <span className="text-[var(--color-text-muted)] shrink-0 font-mono">{note.time}</span>
                    <span className="text-[var(--color-text-secondary)]">{note.text}</span>
                  </div>
                ))}
              </div>
              <div className="px-4 pb-3 flex gap-2">
                <Input
                  placeholder="Add a note..."
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addNote()}
                  className="bg-[var(--color-surface-elevated)] text-xs h-8"
                />
                <Button size="sm" variant="secondary" className="h-8 px-2.5 shrink-0" onClick={addNote}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* ─── RIGHT-BOTTOM: Webcam & Facial Tracking ─── */}
          <div className="shrink-0 h-[280px] flex flex-col">
            <div className="flex items-center justify-between shrink-0 border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-2">
              <div className="flex items-center gap-2">
                <Camera className="h-3.5 w-3.5 text-[var(--color-text-secondary)]" />
                <span className="text-xs font-semibold text-[var(--color-text-primary)]">Facial Tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[var(--color-text-muted)]">{cameraOn ? "Camera On" : "Camera Off"}</span>
                <Switch checked={cameraOn} onCheckedChange={setCameraOn} />
              </div>
            </div>

            <div className="flex-1 flex flex-col">
              {/* Webcam Preview */}
              <div className={cn(
                "flex-1 flex items-center justify-center transition-colors",
                cameraOn ? "bg-[var(--color-surface)]/80" : "bg-[var(--color-background)]"
              )}>
                {cameraOn ? (
                  <div className="text-center">
                    <div className="relative inline-flex">
                      <div className="h-16 w-16 rounded-full bg-[var(--color-surface-elevated)] flex items-center justify-center">
                        <User className="h-8 w-8 text-[var(--color-text-muted)]" />
                      </div>
                      <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-danger)] opacity-75" />
                        <span className="relative inline-flex h-4 w-4 rounded-full bg-[var(--color-danger)] items-center justify-center">
                          <CircleDot className="h-2 w-2 text-white" />
                        </span>
                      </span>
                    </div>
                    <p className="text-[10px] text-[var(--color-text-muted)] mt-2">Webcam preview</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <CameraOff className="h-8 w-8 text-[var(--color-text-muted)]/40 mx-auto mb-2" />
                    <p className="text-xs text-[var(--color-text-muted)]">Camera disabled</p>
                  </div>
                )}
              </div>

              {/* Quality Indicators */}
              <div className="shrink-0 px-4 py-2 border-t border-[var(--color-border)] bg-[var(--color-surface-elevated)]/50 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <Sun className="h-3 w-3 text-[var(--color-success)]" />
                      <span className="text-[var(--color-text-muted)]">Lighting:</span>
                      <span className="text-[var(--color-success)] font-medium">Good</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <User className="h-3 w-3 text-[var(--color-success)]" />
                      <span className="text-[var(--color-text-muted)]">Face visible:</span>
                      <span className="text-[var(--color-success)] font-medium">Yes</span>
                    </span>
                  </div>
                  {recording === "recording" && (
                    <Badge variant="destructive" className="text-[10px] h-4 gap-1 animate-pulse">
                      <CircleDot className="h-2 w-2" />
                      REC
                    </Badge>
                  )}
                </div>
                <p className="text-[10px] text-[var(--color-text-muted)]">
                  Privacy: facial data is processed locally. Only emotional valence scores are transmitted.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════ BOTTOM CONTROLS ═══════════════════ */}
      <footer className="flex h-14 shrink-0 items-center justify-between border-t border-[var(--color-border)] bg-[var(--color-surface)] px-5">
        <div className="flex items-center gap-2">
          {recording === "idle" && (
            <Button size="sm" className="gap-1.5" onClick={() => setRecording("recording")}>
              <CircleDot className="h-3.5 w-3.5" />
              Start Recording
            </Button>
          )}
          {recording === "recording" && (
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setRecording("paused")}>
              <Pause className="h-3.5 w-3.5" />
              Pause
            </Button>
          )}
          {recording === "paused" && (
            <Button size="sm" className="gap-1.5" onClick={() => setRecording("recording")}>
              <Play className="h-3.5 w-3.5" />
              Resume
            </Button>
          )}
          {recording !== "idle" && (
            <Button size="sm" variant="secondary" className="gap-1.5" onClick={() => setRecording("idle")}>
              <Square className="h-3 w-3" />
              Stop Recording
            </Button>
          )}

          <Separator orientation="vertical" className="h-6 mx-1" />

          <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
            {recording === "recording" && (
              <span className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-danger)] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-danger)]" />
                </span>
                Recording
              </span>
            )}
            {recording === "paused" && (
              <span className="flex items-center gap-1.5 text-[var(--color-warning)]">
                <Pause className="h-3 w-3" />
                Paused
              </span>
            )}
            {recording === "idle" && (
              <span className="text-[var(--color-text-muted)]">Not recording</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-[var(--color-danger)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Stop &amp; Discard
          </Button>

          <Button variant="destructive" size="sm" className="gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" />
            End Session
          </Button>
        </div>
      </footer>
    </div>
  )
}
