import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import {
  Save,
  Rocket,
  UserPlus,
  GripVertical,
  Trash2,
  Plus,
  Bot,
  Send,
  Video,
  Monitor,
  Mic,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Eye,
  Sparkles,
  Loader2,
} from "lucide-react"

const focusAreas = [
  "Cognitive Load",
  "Navigation",
  "Forms",
  "Content Clarity",
  "Color & Contrast",
  "Screen Reader",
  "Motor Accessibility",
]

const initialTasks = [
  {
    id: "1",
    title: "Complete the sign-up flow",
    description: "Navigate to the homepage, find the sign-up button, and create an account using the test credentials provided.",
    successCriteria: "Account created and dashboard visible",
  },
  {
    id: "2",
    title: "Search for a product",
    description: "Use the search functionality to find \"wireless headphones\" and navigate to the first result.",
    successCriteria: "Product detail page is displayed",
  },
  {
    id: "3",
    title: "Complete checkout process",
    description: "Add the product to cart and complete the checkout using the test payment details.",
    successCriteria: "Order confirmation page shown with order number",
  },
]

type AgentMsg = { role: "agent" | "user"; content: string }

const checklistItems = [
  { label: "At least 1 target URL provided", passed: true },
  { label: "Study goal is defined", passed: true },
  { label: "Minimum 2 tasks added", passed: true },
  { label: "Success criteria set for all tasks", passed: true },
  { label: "WCAG standard selected", passed: true },
  { label: "Device requirement specified", passed: false },
  { label: "Time estimate configured", passed: false },
]

export default function StudyBuilder() {
  const navigate = useNavigate()
  const [studyName, setStudyName] = useState("Checkout Flow Accessibility Audit")
  const [selectedAreas, setSelectedAreas] = useState(["Cognitive Load", "Forms", "Navigation"])
  const [wcagEnabled, setWcagEnabled] = useState(true)
  const [webcamEnabled, setWebcamEnabled] = useState(false)
  const [tasks, setTasks] = useState(initialTasks)
  const [chatInput, setChatInput] = useState("")
  const [agentMessages, setAgentMessages] = useState<AgentMsg[]>([
    { role: "agent", content: "Hi! I'm your Study Designer Agent. Describe what you want to test and I'll help you build an effective accessibility study — tasks, focus areas, success criteria, and more." },
  ])
  const [agentLoading, setAgentLoading] = useState(false)

  const [publishing, setPublishing] = useState(false)

  const handlePublish = async () => {
    setPublishing(true)
    try {
      const study = await api.studies.create({
        name: studyName,
        goal: (document.querySelector('textarea') as HTMLTextAreaElement)?.value || "",
        targetUrls: [(document.querySelector('input[placeholder*="example.com"]') as HTMLInputElement)?.value || ""],
        wcagLevel: wcagEnabled ? "AA" : undefined,
        focusAreas: selectedAreas,
        captureWebcam: webcamEnabled,
      })

      for (const task of tasks) {
        if (task.title) {
          await api.studies.addTask(study.id, {
            title: task.title,
            description: task.description,
            successCriteria: task.successCriteria,
          })
        }
      }

      await api.studies.publish(study.id)

      navigate("/business/dashboard", {
        state: {
          newStudy: {
            name: studyName,
            tasks: tasks.length,
            focusAreas: selectedAreas,
          },
        },
      })
    } catch (err) {
      console.error("Publish failed:", err)
      navigate("/business/dashboard", {
        state: {
          newStudy: {
            name: studyName,
            tasks: tasks.length,
            focusAreas: selectedAreas,
          },
        },
      })
    } finally {
      setPublishing(false)
    }
  }

  const toggleArea = (area: string) => {
    setSelectedAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    )
  }

  const removeTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  const addTask = () => {
    setTasks((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        title: "",
        description: "",
        successCriteria: "",
      },
    ])
  }

  const sendToAgent = async () => {
    const msg = chatInput.trim()
    if (!msg || agentLoading) return
    setChatInput("")
    setAgentMessages((prev) => [...prev, { role: "user", content: msg }])
    setAgentLoading(true)

    try {
      const result = await api.agents.studyDesigner(msg)

      let agentText = ""
      if (result.type === "patch") {
        if (result.tasks?.length) {
          setTasks(result.tasks.map((t: any, i: number) => ({
            id: String(Date.now() + i),
            title: t.title || "",
            description: t.description || "",
            successCriteria: t.successCriteria || "",
          })))
        }
        if (result.config?.focusAreas) setSelectedAreas(result.config.focusAreas)
        if (result.config?.wcagLevel) setWcagEnabled(result.config.wcagLevel !== "none")
        if (result.config?.captureWebcam !== undefined) setWebcamEnabled(result.config.captureWebcam)
        agentText = `✅ I've updated your study configuration.\n\n${result.explanation || ""}`
      } else if (result.type === "questions") {
        agentText = `${result.explanation || "I have a few questions:"}\n\n${(result.questions || []).map((q: string, i: number) => `${i + 1}. ${q}`).join("\n")}`
      } else {
        agentText = result.content || JSON.stringify(result)
      }

      setAgentMessages((prev) => [...prev, { role: "agent", content: agentText }])
    } catch (err: any) {
      setAgentMessages((prev) => [...prev, { role: "agent", content: `Sorry, I couldn't process that: ${err.message}` }])
    } finally {
      setAgentLoading(false)
    }
  }

  const passedChecks = checklistItems.filter((i) => i.passed).length

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <div className="mx-auto max-w-[1400px] px-6 py-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="flex items-center gap-4 min-w-0">
            <Input
              value={studyName}
              onChange={(e) => setStudyName(e.target.value)}
              className="max-w-md border-transparent bg-transparent font-display text-xl font-bold text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus-visible:border-[var(--color-border)] focus-visible:bg-[var(--color-surface)] h-auto py-1 px-2 -ml-2"
            />
            <Badge variant="secondary">Draft</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" className="gap-2">
              <Save className="h-3.5 w-3.5" />
              Save Draft
            </Button>
            <Button size="sm" className="gap-2" onClick={handlePublish} disabled={publishing}>
              <Rocket className="h-3.5 w-3.5" />
              {publishing ? "Publishing..." : "Publish"}
            </Button>
            <Button variant="outline" size="sm" className="gap-2" disabled>
              <UserPlus className="h-3.5 w-3.5" />
              Invite Testers
            </Button>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_0.67fr]">
          {/* LEFT: Study setup */}
          <div className="space-y-6">
            {/* Target URLs */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Target URL(s)</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="https://example.com/checkout"
                  defaultValue="https://staging.acmeshop.com/checkout"
                />
                <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                  Enter the page(s) testers will evaluate. Separate multiple URLs with commas.
                </p>
              </CardContent>
            </Card>

            {/* Goal */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Goal / Request</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Describe what you want to learn from this study..."
                  defaultValue="Evaluate the checkout flow for cognitive accessibility barriers. We're seeing a 40% drop-off rate among users who self-report ADHD or dyslexia. We need to identify friction points and get actionable recommendations for reducing cognitive load during the payment process."
                  className="min-h-[100px]"
                />
              </CardContent>
            </Card>

            {/* Standards & Focus */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Standards & Focus Areas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">
                      WCAG 2.2 AA
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Web Content Accessibility Guidelines
                    </p>
                  </div>
                  <Switch checked={wcagEnabled} onCheckedChange={setWcagEnabled} />
                </div>
                <div>
                  <p className="mb-2.5 text-sm text-[var(--color-text-secondary)]">
                    Focus areas
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {focusAreas.map((area) => {
                      const active = selectedAreas.includes(area)
                      return (
                        <button
                          key={area}
                          onClick={() => toggleArea(area)}
                          className={cn(
                            "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                            active
                              ? "border-[var(--color-accent)]/40 bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                              : "border-[var(--color-border)] bg-transparent text-[var(--color-text-muted)] hover:border-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
                          )}
                        >
                          {area}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Capture settings */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Capture Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--color-border)]/50 bg-[var(--color-surface-elevated)]/50 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4 text-[var(--color-accent)]" />
                      <span className="text-sm text-[var(--color-text-primary)]">Screen</span>
                    </div>
                    <span className="text-[var(--color-text-muted)]">+</span>
                    <div className="flex items-center gap-2">
                      <Mic className="h-4 w-4 text-[var(--color-accent)]" />
                      <span className="text-sm text-[var(--color-text-primary)]">Audio</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">Required</Badge>
                </div>
                <div className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--color-border)]/50 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Video className="h-4 w-4 text-[var(--color-text-secondary)]" />
                    <span className="text-sm text-[var(--color-text-primary)]">
                      Webcam
                    </span>
                  </div>
                  <Switch checked={webcamEnabled} onCheckedChange={setWebcamEnabled} />
                </div>
              </CardContent>
            </Card>

            {/* Task list */}
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-base">
                  Tasks ({tasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {tasks.map((task, index) => (
                  <div
                    key={task.id}
                    className="group rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)]/50 p-4 transition-colors hover:border-[var(--color-text-muted)]/30"
                  >
                    <div className="flex items-start gap-3">
                      <button className="mt-1.5 shrink-0 cursor-grab text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors">
                        <GripVertical className="h-4 w-4" />
                      </button>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)]/10 text-[10px] font-bold text-[var(--color-accent)]">
                            {index + 1}
                          </span>
                          <Input
                            placeholder="Task title"
                            defaultValue={task.title}
                            className="h-8 border-transparent bg-transparent font-medium placeholder:text-[var(--color-text-muted)] focus-visible:border-[var(--color-border)] focus-visible:bg-[var(--color-surface)]"
                          />
                        </div>
                        <Textarea
                          placeholder="Describe what the tester should do..."
                          defaultValue={task.description}
                          className="min-h-[60px] text-sm"
                        />
                        <div>
                          <label className="mb-1 block text-xs text-[var(--color-text-muted)]">
                            Success looks like
                          </label>
                          <Input
                            placeholder="What indicates this task is complete?"
                            defaultValue={task.successCriteria}
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => removeTask(task.id)}
                        className="mt-1.5 shrink-0 rounded-[var(--radius-sm)] p-1 text-[var(--color-text-muted)] opacity-0 transition-all hover:bg-[var(--color-danger)]/10 hover:text-[var(--color-danger)] group-hover:opacity-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 border-dashed"
                  onClick={addTask}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Task
                </Button>
              </CardContent>
            </Card>

            {/* Tester requirements */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Tester Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1.5 block text-xs text-[var(--color-text-muted)]">
                      Device Type
                    </label>
                    <Select defaultValue="any">
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select device" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any Device</SelectItem>
                        <SelectItem value="desktop">Desktop Only</SelectItem>
                        <SelectItem value="mobile">Mobile Only</SelectItem>
                        <SelectItem value="tablet">Tablet Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs text-[var(--color-text-muted)]">
                      Time Estimate
                    </label>
                    <Input
                      placeholder="e.g. 15 min"
                      defaultValue="20 min"
                      className="h-9"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs text-[var(--color-text-muted)]">
                      Language
                    </label>
                    <Select defaultValue="en">
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="pt">Portuguese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT: Agent assistant panel */}
          <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <Card className="flex flex-col overflow-hidden h-[calc(100vh-8rem)]">
              <CardHeader className="shrink-0 border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)]/50 pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-accent)]/10">
                    <Bot className="h-4 w-4 text-[var(--color-accent)]" />
                  </div>
                  <div>
                    <CardTitle className="text-sm">Study Designer Agent</CardTitle>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      AI-powered study optimization
                    </p>
                  </div>
                  <div className="ml-auto flex h-2 w-2 rounded-full bg-[var(--color-success)]" />
                </div>
              </CardHeader>
              <ScrollArea className="flex-1">
                <div className="space-y-4 p-4">
                  {agentMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex",
                        msg.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[85%] rounded-[var(--radius-lg)] px-3.5 py-2.5 text-sm leading-relaxed",
                          msg.role === "agent"
                            ? "bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)] border border-[var(--color-border)]/50"
                            : "bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/20"
                        )}
                      >
                        {msg.role === "agent" && (
                          <div className="mb-1.5 flex items-center gap-1.5">
                            <Sparkles className="h-3 w-3 text-[var(--color-accent)]" />
                            <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-accent)]">
                              Agent
                            </span>
                          </div>
                        )}
                        <span className="whitespace-pre-wrap">{msg.content}</span>
                      </div>
                    </div>
                  ))}
                  {agentLoading && (
                    <div className="flex justify-start">
                      <div className="flex items-center gap-2 rounded-[var(--radius-lg)] bg-[var(--color-surface-elevated)] border border-[var(--color-border)]/50 px-3.5 py-2.5 text-sm">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--color-accent)]" />
                        <span className="text-[var(--color-text-muted)]">Thinking...</span>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="shrink-0 border-t border-[var(--color-border)] p-3">
                <div className="flex items-end gap-2">
                  <Textarea
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendToAgent(); } }}
                    placeholder="Ask for suggestions or help..."
                    className="min-h-[40px] max-h-[100px] resize-none text-sm"
                    rows={1}
                  />
                  <Button size="icon" className="h-10 w-10 shrink-0" onClick={sendToAgent} disabled={agentLoading || !chatInput.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Publishing checklist */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Publishing Checklist</CardTitle>
                  <span className="text-xs tabular-nums text-[var(--color-text-muted)]">
                    {passedChecks}/{checklistItems.length}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {checklistItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-2.5"
                  >
                    {item.passed ? (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[var(--color-success)]" />
                    ) : (
                      <AlertCircle className="h-3.5 w-3.5 shrink-0 text-[var(--color-warning)]" />
                    )}
                    <span
                      className={cn(
                        "text-xs",
                        item.passed
                          ? "text-[var(--color-text-secondary)]"
                          : "text-[var(--color-warning)]"
                      )}
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Preview link */}
            <button className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] py-3 text-sm text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-accent)]/40 hover:text-[var(--color-accent)]">
              <Eye className="h-4 w-4" />
              Preview tester experience
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
