import { useRef, useEffect, useState } from "react"
import {
  Bot,
  Send,
  Check,
  ChevronDown,
  ChevronUp,
  Volume2,
  VolumeX,
  CircleDot,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

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

interface LatchGuideProps {
  chat: ChatMessage[]
  onSendChat: (text: string) => void
  tasks: Task[]
  currentTask: Task | undefined
  completedCount: number
  onMarkComplete: (taskId: string) => void
  floating?: boolean
}

export function LatchGuide({ chat, onSendChat, tasks, currentTask, completedCount, onMarkComplete, floating }: LatchGuideProps) {
  const [chatInput, setChatInput] = useState("")
  const [agentMuted, setAgentMuted] = useState(false)
  const [taskPanelOpen, setTaskPanelOpen] = useState(true)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chat])

  function sendChat() {
    if (!chatInput.trim()) return
    onSendChat(chatInput.trim())
    setChatInput("")
  }

  return (
    <div className={cn(floating ? "flex flex-col" : "flex w-[380px] shrink-0 flex-col")}>
      <div className={cn("flex flex-col min-h-0", floating ? "max-h-[45vh]" : "flex-1")}>
        {!floating && (
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
        )}

        <ScrollArea className="flex-1 min-h-0">
          <div className="p-3 space-y-2.5">
            {chat.map((msg) => (
              <div key={msg.id} className={cn("flex gap-2", msg.sender === "user" && "flex-row-reverse")}>
                {msg.sender === "agent" && (
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)]/10 mt-0.5">
                    <Bot className="h-2.5 w-2.5 text-[var(--color-accent)]" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[85%] rounded-[var(--radius-md)] px-2.5 py-1.5 text-xs leading-relaxed",
                    msg.sender === "agent"
                      ? "bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)]"
                      : "bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                  )}
                >
                  {msg.text}
                  <span className={cn(
                    "block text-[9px] mt-0.5",
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

        <div className="shrink-0 border-t border-[var(--color-border)] p-2">
          <div className="flex gap-1.5">
            <Input
              placeholder="Ask the Latch Guide..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendChat()}
              className="bg-[var(--color-surface-elevated)] text-xs h-8"
            />
            <Button size="icon" className="shrink-0 h-8 w-8" onClick={sendChat}>
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Task Progress */}
      <div className="shrink-0 border-t border-[var(--color-border)]">
        <button
          className="flex w-full items-center justify-between bg-[var(--color-surface-elevated)]/80 px-3 py-2 text-xs font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] transition-colors"
          onClick={() => setTaskPanelOpen(!taskPanelOpen)}
        >
          <span className="flex items-center gap-1.5">
            <CircleDot className="h-3.5 w-3.5 text-[var(--color-accent)]" />
            Tasks — {completedCount}/{tasks.length}
          </span>
          {taskPanelOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
        </button>

        {taskPanelOpen && (
          <div className="border-t border-[var(--color-border)] bg-[var(--color-surface)] p-2 space-y-1 max-h-[200px] overflow-y-auto">
            {tasks.map((task, idx) => {
              const isCurrent = currentTask?.id === task.id
              return (
                <div
                  key={task.id}
                  className={cn(
                    "flex items-center justify-between rounded-[var(--radius-md)] px-2.5 py-1.5 text-xs transition-all",
                    isCurrent && "bg-[var(--color-accent)]/[0.08] border border-[var(--color-accent)]/20",
                    task.done && "opacity-60",
                    !isCurrent && !task.done && "hover:bg-[var(--color-surface-hover)]"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 text-[9px] font-bold transition-colors",
                        task.done
                          ? "border-[var(--color-success)] bg-[var(--color-success)] text-white"
                          : isCurrent
                            ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                            : "border-[var(--color-border)] text-[var(--color-text-muted)]"
                      )}
                    >
                      {task.done ? <Check className="h-2.5 w-2.5" /> : idx + 1}
                    </div>
                    <span className={cn(
                      "text-xs",
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
                      className="h-5 text-[10px] px-2 gap-0.5"
                      onClick={() => onMarkComplete(task.id)}
                    >
                      <Check className="h-2.5 w-2.5" />
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
  )
}
