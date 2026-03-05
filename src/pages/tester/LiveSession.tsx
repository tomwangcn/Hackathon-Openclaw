import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { useNavigate, useParams } from "react-router-dom"
import { api } from "@/lib/api"
import {
  Monitor,
  Mic,
  Camera,
  Play,
  Pause,
  Clock,
  X,
  Bot,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/Logo"
import { WebsitePreview } from "@/components/session/WebsitePreview"
import { WebcamPip } from "@/components/session/WebcamPip"
import { LatchGuide } from "@/components/session/LatchGuide"
import { FloatingPanel } from "@/components/session/FloatingPanel"
import { useMouseTracker } from "@/hooks/useMouseTracker"
import { usePipWindow } from "@/hooks/usePipWindow"

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

export default function LiveSession() {
  const navigate = useNavigate()
  const { id: sessionId } = useParams<{ id: string }>()
  const [studyName, setStudyName] = useState("Loading...")
  const [targetUrl, setTargetUrl] = useState<string | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [chat, setChat] = useState<ChatMessage[]>([{
    id: 1,
    sender: "agent",
    text: "Hi! I'm the Latch Guide, your AI companion for this session. I'll help you through each task and note any observations. Take your time — there are no wrong answers here.",
    time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
  }])
  const [cameraOn, setCameraOn] = useState(true)
  const [recording, setRecording] = useState<"idle" | "recording" | "paused">("recording")
  const [elapsed, setElapsed] = useState(0)
  const [loading, setLoading] = useState(true)
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null)
  const [screenSharing, setScreenSharing] = useState(false)
  const [currentEmotion, setCurrentEmotion] = useState<{ dominant: string; emotions: Record<string, number> } | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const completedCount = tasks.filter((t) => t.done).length
  const currentTask = tasks.find((t) => !t.done)

  const { flush: flushInteractions } = useMouseTracker(sessionId, screenSharing && recording === "recording")
  const { pipWindow, open: openPip, close: closePip, supported: pipSupported } = usePipWindow()

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
        setWebcamStream(mediaStream)
        setCameraOn(true)
      })
      .catch(() => {
        setCameraOn(false)
      })
    return () => {
      webcamStream?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  useEffect(() => {
    if (!sessionId || !webcamStream || !cameraOn || recording !== "recording") return
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
  }, [sessionId, webcamStream, cameraOn, recording])

  useEffect(() => {
    if (recording !== "recording") return
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(interval)
  }, [recording])

  async function handleScreenReady() {
    setScreenSharing(true)
    if (pipSupported) {
      await openPip(400, 680)
    }
  }

  function handleScreenEnded() {
    setScreenSharing(false)
  }

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

  async function handleSendChat(text: string) {
    const now = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
    setChat((prev) => [...prev, { id: Date.now(), sender: "user", text, time: now }])

    if (!sessionId) return

    try {
      const active = currentTask ? { title: currentTask.name, description: "" } : null
      const result = await api.agents.facilitator({
        sessionId,
        message: text,
        currentTask: active,
        timeOnTaskSeconds: elapsed,
        completedTasks: completedCount,
        totalTasks: tasks.length,
      })

      const suggestions = (result.suggestions || []).filter((s: any) => s.urgency >= 3)
      for (const suggestion of suggestions) {
        setChat((prev) => [...prev, {
          id: Date.now() + Math.random(),
          sender: "agent",
          text: suggestion.text,
          time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
        }])
      }

      if (suggestions.length === 0 && result.suggestions?.length === 0) {
        setChat((prev) => [...prev, {
          id: Date.now() + Math.random(),
          sender: "agent",
          text: "You're doing great! Let me know if you need any help.",
          time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
        }])
      }
    } catch {
      setChat((prev) => [...prev, {
        id: Date.now() + Math.random(),
        sender: "agent",
        text: "I'm here to help — feel free to ask anything about the current task.",
        time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      }])
    }
  }

  async function handleEndSession() {
    if (sessionId) {
      await Promise.all([
        api.emotions.finalize(sessionId).catch(() => {}),
        flushInteractions(),
        api.interactions.finalize(sessionId).catch(() => {}),
      ])
    }
    closePip()
    webcamStream?.getTracks().forEach((t) => t.stop())
    navigate("/tester/dashboard")
  }

  // The controls panel (webcam + guide + tasks) — rendered either in PiP window or as floating panels
  const controlsPanel = (
    <div className="flex flex-col h-full bg-[var(--color-background)] text-[var(--color-text-primary)]">
      {/* Mini top bar inside PiP */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 shrink-0">
        <div className="flex items-center gap-2">
          <Logo size="sm" />
          <span className="text-xs font-medium truncate max-w-[140px]">{studyName}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 font-mono text-[11px]">
            <Clock className="h-2.5 w-2.5 text-[var(--color-text-muted)]" />
            {formatTime(elapsed)}
          </div>
          <div className="flex items-center gap-1.5">
            {recording === "recording" && (
              <Button variant="outline" size="sm" className="h-5 text-[10px] gap-0.5 px-1.5" onClick={() => setRecording("paused")}>
                <Pause className="h-2 w-2" />
                Pause
              </Button>
            )}
            {recording === "paused" && (
              <Button size="sm" className="h-5 text-[10px] gap-0.5 px-1.5" onClick={() => setRecording("recording")}>
                <Play className="h-2 w-2" />
                Resume
              </Button>
            )}
            <Button variant="destructive" size="sm" className="h-5 text-[10px] gap-0.5 px-1.5" onClick={handleEndSession}>
              <X className="h-2 w-2" />
              End
            </Button>
          </div>
        </div>
      </div>

      {/* Recording indicators */}
      <div className="flex items-center gap-3 px-3 py-1.5 border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)]/50">
        {[
          { icon: Monitor, label: "Screen", active: screenSharing },
          { icon: Mic, label: "Audio", active: true },
          { icon: Camera, label: "Webcam", active: cameraOn },
        ].map((r) => (
          <div key={r.label} className="flex items-center gap-1 text-[10px]">
            {r.active && (
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-danger)] opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-danger)]" />
              </span>
            )}
            <r.icon className={cn("h-2.5 w-2.5", r.active ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-muted)]")} />
            <span className={r.active ? "text-[var(--color-text-secondary)]" : "text-[var(--color-text-muted)]"}>
              {r.label}
            </span>
          </div>
        ))}
        <span className="ml-auto text-[10px] text-[var(--color-text-secondary)]">
          {completedCount}/{tasks.length} tasks
        </span>
      </div>

      {/* Webcam */}
      <div className="shrink-0 border-b border-[var(--color-border)]">
        <WebcamPip
          stream={webcamStream}
          cameraOn={cameraOn}
          setCameraOn={setCameraOn}
          recording={recording}
          currentEmotion={currentEmotion}
          videoRef={videoRef}
        />
      </div>

      {/* Latch Guide + Tasks */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <LatchGuide
          chat={chat}
          onSendChat={handleSendChat}
          tasks={tasks}
          currentTask={currentTask}
          completedCount={completedCount}
          onMarkComplete={markComplete}
          floating
        />
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[var(--color-background)] overflow-hidden">
      <canvas ref={canvasRef} className="hidden" />

      {/* Screen Capture fills the main window */}
      <div className="flex-1 relative">
        <WebsitePreview
          targetUrl={targetUrl}
          onStreamReady={handleScreenReady}
          onStreamEnded={handleScreenEnded}
        />
      </div>

      {/* Controls: render into PiP window if available, otherwise floating panels */}
      {pipWindow ? (
        createPortal(controlsPanel, pipWindow.document.body)
      ) : (
        <>
          {/* Fallback: floating top bar */}
          <div className="fixed top-0 left-0 right-0 z-[110]">
            <header className="flex h-11 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-md px-4 shadow-sm">
              <div className="flex items-center gap-4">
                <Logo size="sm" />
                <span className="text-sm font-medium text-[var(--color-text-primary)] truncate max-w-[220px]">
                  {studyName}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                  <span className="font-medium text-[var(--color-text-primary)]">{completedCount}/{tasks.length}</span>
                  tasks
                </div>
                <div className="flex items-center gap-2.5">
                  {[
                    { icon: Monitor, label: "Screen", active: screenSharing },
                    { icon: Mic, label: "Audio", active: true },
                    { icon: Camera, label: "Webcam", active: cameraOn },
                  ].map((r) => (
                    <div key={r.label} className="flex items-center gap-1 text-[11px]">
                      {r.active && (
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-danger)] opacity-75" />
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-danger)]" />
                        </span>
                      )}
                      <r.icon className={cn("h-3 w-3", r.active ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-muted)]")} />
                      <span className={r.active ? "text-[var(--color-text-secondary)]" : "text-[var(--color-text-muted)]"}>
                        {r.label}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-1 font-mono text-xs text-[var(--color-text-primary)]">
                  <Clock className="h-3 w-3 text-[var(--color-text-muted)]" />
                  {formatTime(elapsed)}
                </div>
                {recording === "recording" && (
                  <Button variant="outline" size="sm" className="h-6 text-[11px] gap-1 px-2" onClick={() => setRecording("paused")}>
                    <Pause className="h-2.5 w-2.5" />
                    Pause
                  </Button>
                )}
                {recording === "paused" && (
                  <Button size="sm" className="h-6 text-[11px] gap-1 px-2" onClick={() => setRecording("recording")}>
                    <Play className="h-2.5 w-2.5" />
                    Resume
                  </Button>
                )}
                <Button variant="destructive" size="sm" className="h-6 text-[11px] gap-1 px-2" onClick={handleEndSession}>
                  <X className="h-2.5 w-2.5" />
                  End Session
                </Button>
              </div>
            </header>
          </div>

          {/* Fallback: floating webcam */}
          <div className="fixed bottom-4 left-4 z-[100]">
            <WebcamPip
              stream={webcamStream}
              cameraOn={cameraOn}
              setCameraOn={setCameraOn}
              recording={recording}
              currentEmotion={currentEmotion}
              videoRef={videoRef}
            />
          </div>

          {/* Fallback: floating latch guide */}
          <FloatingPanel
            title="Latch Guide"
            icon={<Bot className="h-3.5 w-3.5 text-[var(--color-accent)]" />}
            defaultPosition={{ x: window.innerWidth - 380, y: 56 }}
            width={360}
          >
            <LatchGuide
              chat={chat}
              onSendChat={handleSendChat}
              tasks={tasks}
              currentTask={currentTask}
              completedCount={completedCount}
              onMarkComplete={markComplete}
              floating
            />
          </FloatingPanel>
        </>
      )}
    </div>
  )
}
