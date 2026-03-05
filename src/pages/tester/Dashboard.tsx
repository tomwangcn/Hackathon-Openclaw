import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "@/lib/api"
import {
  ClipboardCheck,
  Play,
  Loader2,
  CheckCircle2,
  Clock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  CircleDot,
  Zap,
  Eye,
  XCircle,
  StickyNote,
  FileText,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

type TestStatus = "not_started" | "in_session" | "uploading" | "processing" | "report_ready" | "completed"

interface DashboardTest {
  id: string
  title: string
  business: string
  acceptedDate: string
  status: TestStatus
  tasksCompleted: number
  tasksTotal: number
  tasks: { name: string; done: boolean }[]
  notes: string
}

const STATUS_CONFIG: Record<TestStatus, { label: string; variant: "secondary" | "info" | "warning" | "success" | "default" | "outline"; icon: typeof Play }> = {
  not_started: { label: "Not Started", variant: "secondary", icon: CircleDot },
  in_session: { label: "In Session", variant: "info", icon: Play },
  uploading: { label: "Uploading", variant: "warning", icon: Loader2 },
  processing: { label: "Report Processing", variant: "warning", icon: Loader2 },
  report_ready: { label: "Report Ready", variant: "success", icon: FileText },
  completed: { label: "Completed", variant: "default", icon: CheckCircle2 },
}

const MOCK_TESTS: DashboardTest[] = [
  {
    id: "d1",
    title: "NHS Digital Portal Navigation Audit",
    business: "NHS England",
    acceptedDate: "28 Feb 2026",
    status: "in_session",
    tasksCompleted: 2,
    tasksTotal: 5,
    tasks: [
      { name: "Navigate to the appointment booking page", done: true },
      { name: "Search for a GP in your area", done: true },
      { name: "Select a time slot and complete booking", done: false },
      { name: "Attempt to reschedule the appointment", done: false },
      { name: "Locate the prescription repeat request", done: false },
    ],
    notes: "The search bar was hard to find — it blended into the header.",
  },
  {
    id: "d2",
    title: "Checkout Flow Usability Study",
    business: "Ocado Technology",
    acceptedDate: "25 Feb 2026",
    status: "not_started",
    tasksCompleted: 0,
    tasksTotal: 5,
    tasks: [
      { name: "Add 3 items to basket from homepage", done: false },
      { name: "Proceed to checkout", done: false },
      { name: "Fill in delivery address details", done: false },
      { name: "Apply discount code TESTCODE10", done: false },
      { name: "Complete the mock payment flow", done: false },
    ],
    notes: "",
  },
  {
    id: "d3",
    title: "Student Dashboard Cognitive Load Test",
    business: "Open University",
    acceptedDate: "20 Feb 2026",
    status: "processing",
    tasksCompleted: 6,
    tasksTotal: 6,
    tasks: [
      { name: "Log in and navigate to current module", done: true },
      { name: "Find and open upcoming assignment", done: true },
      { name: "Upload a mock submission file", done: true },
      { name: "Navigate to the grades section", done: true },
      { name: "Review feedback on previous assignment", done: true },
      { name: "Locate the discussion forum", done: true },
    ],
    notes: "Grades section took a while to find. The sidebar label was confusing.",
  },
  {
    id: "d4",
    title: "GOV.UK Benefits Application Form",
    business: "Government Digital Service",
    acceptedDate: "15 Feb 2026",
    status: "report_ready",
    tasksCompleted: 5,
    tasksTotal: 5,
    tasks: [
      { name: "Begin the Universal Credit application", done: true },
      { name: "Complete personal details section", done: true },
      { name: "Navigate housing costs questionnaire", done: true },
      { name: "Upload mock identity document", done: true },
      { name: "Review and submit application", done: true },
    ],
    notes: "The document upload had no progress indicator. I wasn't sure if it was working.",
  },
  {
    id: "d5",
    title: "SaaS Onboarding Wizard Evaluation",
    business: "Notion Labs",
    acceptedDate: "10 Feb 2026",
    status: "completed",
    tasksCompleted: 4,
    tasksTotal: 4,
    tasks: [
      { name: "Create a new workspace", done: true },
      { name: "Follow onboarding wizard steps", done: true },
      { name: "Create first page using template", done: true },
      { name: "Invite a mock team member", done: true },
    ],
    notes: "Overall smooth. The template selector was great.",
  },
]

const inProgressTest = MOCK_TESTS.find((t) => t.status === "in_session")

export default function Dashboard() {
  const navigate = useNavigate()
  const [tests, setTests] = useState<DashboardTest[]>(MOCK_TESTS)
  const [expandedRow, setExpandedRow] = useState<string | null>(inProgressTest?.id ?? null)

  useEffect(() => {
    api.sessions.mine().then((sessions) => {
      if (sessions && sessions.length > 0) {
        const mapped: DashboardTest[] = sessions.map((s: any) => {
          const statusMap: Record<string, TestStatus> = {
            assigned: "not_started",
            in_progress: "in_session",
            uploading: "uploading",
            processing: "processing",
            completed: "report_ready",
          }
          const taskResults = s.taskResults || []
          const studyTasks = s.study?.tasks || []
          const completedCount = taskResults.filter((tr: any) => tr.completed).length
          return {
            id: s.id,
            title: s.study?.name || "Untitled Study",
            business: s.study?.org?.name || "Unknown",
            acceptedDate: new Date(s.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
            status: statusMap[s.status] || "not_started",
            tasksCompleted: completedCount,
            tasksTotal: studyTasks.length,
            tasks: studyTasks.map((t: any) => ({
              name: t.title,
              done: taskResults.some((tr: any) => tr.taskId === t.id && tr.completed),
            })),
            notes: "",
          }
        })
        setTests(mapped)
      }
    }).catch(() => {})
  }, [])

  function goToSession(testId: string) {
    navigate(`/tester/session/${testId}`)
  }

  const currentInProgress = tests.find((t) => t.status === "in_session")

  const statCards = [
    { label: "Accepted", count: tests.length, icon: ClipboardCheck, color: "text-[var(--color-info)]", bg: "bg-[var(--color-info)]/10" },
    { label: "In Progress", count: tests.filter((t) => t.status === "in_session").length, icon: Play, color: "text-[var(--color-accent)]", bg: "bg-[var(--color-accent)]/10" },
    { label: "Processing", count: tests.filter((t) => t.status === "processing" || t.status === "uploading").length, icon: Loader2, color: "text-[var(--color-warning)]", bg: "bg-[var(--color-warning)]/10" },
    { label: "Completed", count: tests.filter((t) => t.status === "completed" || t.status === "report_ready").length, icon: CheckCircle2, color: "text-[var(--color-success)]", bg: "bg-[var(--color-success)]/10" },
  ]

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <div className="mx-auto max-w-7xl px-6 py-8 space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="font-display text-2xl font-bold">My Dashboard</h1>
          <p className="text-[var(--color-text-secondary)] text-sm mt-1">
            Track your accepted studies, sessions, and results.
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.label} className="overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-medium mb-1">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-display font-bold">{stat.count}</p>
                  </div>
                  <div className={cn("flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)]", stat.bg)}>
                    <stat.icon className={cn("h-5 w-5", stat.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Next Action Banner */}
        {currentInProgress && (
          <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-accent)]/20 bg-gradient-to-r from-[var(--color-accent)]/[0.06] via-[var(--color-surface)] to-[var(--color-surface)]">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--color-accent)]" />
            <div className="flex items-center justify-between p-5 pl-6">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent)]/10">
                  <Zap className="h-5 w-5 text-[var(--color-accent)]" />
                </div>
                <div>
                  <p className="text-xs text-[var(--color-accent)] font-semibold uppercase tracking-wider mb-0.5">
                    Recommended Action
                  </p>
                  <p className="text-sm text-[var(--color-text-primary)] font-medium">
                    Continue your <span className="text-[var(--color-accent)]">{currentInProgress.title}</span> session
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                    {currentInProgress.tasksCompleted}/{currentInProgress.tasksTotal} tasks completed
                  </p>
                </div>
              </div>
              <Button className="gap-2" onClick={() => goToSession(currentInProgress.id)}>
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Tests Table */}
        <div>
          <h2 className="font-display text-lg font-semibold mb-4">Accepted Studies</h2>

          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-[1fr_120px_140px_180px_200px] gap-4 items-center px-5 py-3 bg-[var(--color-surface-elevated)] text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-medium border-b border-[var(--color-border)]">
              <span>Study</span>
              <span>Accepted</span>
              <span>Status</span>
              <span>Progress</span>
              <span className="text-right">Actions</span>
            </div>

            {/* Table Rows */}
            {tests.map((test) => {
              const isExpanded = expandedRow === test.id
              const config = STATUS_CONFIG[test.status]
              const progressPct = test.tasksTotal > 0 ? (test.tasksCompleted / test.tasksTotal) * 100 : 0

              return (
                <div key={test.id} className="border-b border-[var(--color-border)] last:border-b-0">
                  {/* Main Row */}
                  <div
                    className={cn(
                      "grid grid-cols-[1fr_120px_140px_180px_200px] gap-4 items-center px-5 py-4 transition-colors cursor-pointer hover:bg-[var(--color-surface-hover)]/50",
                      isExpanded && "bg-[var(--color-surface)]/80"
                    )}
                    onClick={() => setExpandedRow(isExpanded ? null : test.id)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button className="shrink-0 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                          {test.title}
                        </p>
                        <p className="text-xs text-[var(--color-text-muted)] truncate">{test.business}</p>
                      </div>
                    </div>

                    <span className="text-xs text-[var(--color-text-secondary)]">{test.acceptedDate}</span>

                    <div>
                      <Badge variant={config.variant} className="gap-1 text-xs">
                        <config.icon className={cn("h-3 w-3", test.status === "uploading" || test.status === "processing" ? "animate-spin" : "")} />
                        {config.label}
                      </Badge>
                    </div>

                    <div className="space-y-1.5 min-w-0 overflow-hidden">
                      <div className="text-xs">
                        <span className="text-[var(--color-text-secondary)]">
                          {test.tasksCompleted}/{test.tasksTotal} tasks
                        </span>
                      </div>
                      <Progress value={progressPct} className="h-1.5 max-w-[120px]" />
                    </div>

                    <div className="flex justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                      {test.status === "not_started" && (
                        <>
                          <Button size="sm" className="gap-1 h-7 text-xs" onClick={() => goToSession(test.id)}>
                            <Play className="h-3 w-3" />
                            Start
                          </Button>
                          <Button size="sm" variant="ghost" className="gap-1 h-7 text-xs text-[var(--color-danger)] hover:text-[var(--color-danger)]">
                            <XCircle className="h-3 w-3" />
                            Withdraw
                          </Button>
                        </>
                      )}
                      {test.status === "in_session" && (
                        <>
                          <Button size="sm" className="gap-1 h-7 text-xs" onClick={() => goToSession(test.id)}>
                            <Play className="h-3 w-3" />
                            Continue
                          </Button>
                          <Button size="sm" variant="ghost" className="gap-1 h-7 text-xs text-[var(--color-danger)] hover:text-[var(--color-danger)]">
                            <XCircle className="h-3 w-3" />
                            Withdraw
                          </Button>
                        </>
                      )}
                      {test.status === "report_ready" && (
                        <Button size="sm" variant="outline" className="gap-1 h-7 text-xs">
                          <Eye className="h-3 w-3" />
                          View Report
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Task Drill-Down */}
                  {isExpanded && (
                    <div className="bg-[var(--color-surface-elevated)]/50 px-5 pb-5">
                      <div className="ml-7 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
                        {/* Task List */}
                        <div>
                          <h4 className="font-display text-sm font-semibold mb-3 flex items-center gap-2">
                            <ClipboardCheck className="h-4 w-4 text-[var(--color-accent)]" />
                            Tasks
                          </h4>
                          <div className="space-y-1.5">
                            {test.tasks.map((task, i) => (
                              <div
                                key={i}
                                className={cn(
                                  "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-sm transition-colors",
                                  task.done
                                    ? "bg-[var(--color-success)]/5"
                                    : "bg-[var(--color-surface)]"
                                )}
                              >
                                <div
                                  className={cn(
                                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                                    task.done
                                      ? "border-[var(--color-success)] bg-[var(--color-success)] text-white"
                                      : "border-[var(--color-border)]"
                                  )}
                                >
                                  {task.done && <CheckCircle2 className="h-3 w-3" />}
                                </div>
                                <span
                                  className={cn(
                                    "text-sm",
                                    task.done
                                      ? "text-[var(--color-text-muted)] line-through"
                                      : "text-[var(--color-text-secondary)]"
                                  )}
                                >
                                  {task.name}
                                </span>
                              </div>
                            ))}
                          </div>

                          {test.status === "not_started" && (
                            <Button className="mt-4 gap-2" onClick={() => goToSession(test.id)}>
                              <Play className="h-4 w-4" />
                              Start Test
                            </Button>
                          )}
                          {test.status === "in_session" && (
                            <Button className="mt-4 gap-2" onClick={() => goToSession(test.id)}>
                              <Play className="h-4 w-4" />
                              Continue Session
                            </Button>
                          )}
                        </div>

                        {/* Notes */}
                        <div>
                          <h4 className="font-display text-sm font-semibold mb-3 flex items-center gap-2">
                            <StickyNote className="h-4 w-4 text-[var(--color-warning)]" />
                            Notes
                          </h4>
                          <Textarea
                            placeholder="Add notes about this study..."
                            defaultValue={test.notes}
                            className="min-h-[120px] bg-[var(--color-surface)] text-sm"
                          />
                        </div>
                      </div>

                      <Separator className="mt-5 ml-7" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
