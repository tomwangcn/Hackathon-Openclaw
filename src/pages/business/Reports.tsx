import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Clock,
  Users,
  FileText,
  Eye,
  CheckSquare,
  Square,
  Pencil,
  Check,
  ExternalLink,
  Sparkles,
  Shield,
  Target,
  Zap,
  FlaskConical,
  ArrowRight,
  Bug,
  ChevronRight,
} from "lucide-react"
import { SdgBadge } from "@/components/SdgBadge"

// --- Studies list data ---

const studiesList = [
  {
    id: "1",
    name: "Checkout Flow Accessibility Audit",
    status: "Active" as const,
    sessions: 48,
    targetSessions: 60,
    findings: 42,
    critical: 3,
    completionRate: 87,
    lastActivity: "12 min ago",
  },
  {
    id: "2",
    name: "Onboarding Redesign",
    status: "Completed" as const,
    sessions: 62,
    targetSessions: 60,
    findings: 28,
    critical: 1,
    completionRate: 84,
    lastActivity: "2 hours ago",
  },
  {
    id: "3",
    name: "Search UX Improvements",
    status: "Active" as const,
    sessions: 31,
    targetSessions: 50,
    findings: 15,
    critical: 0,
    completionRate: 78,
    lastActivity: "45 min ago",
  },
  {
    id: "4",
    name: "Form Accessibility Audit",
    status: "Active" as const,
    sessions: 19,
    targetSessions: 30,
    findings: 9,
    critical: 2,
    completionRate: 95,
    lastActivity: "3 hours ago",
  },
  {
    id: "5",
    name: "Dashboard Usability",
    status: "Completed" as const,
    sessions: 55,
    targetSessions: 50,
    findings: 22,
    critical: 0,
    completionRate: 88,
    lastActivity: "5 days ago",
  },
  {
    id: "6",
    name: "Mobile Navigation",
    status: "Draft" as const,
    sessions: 0,
    targetSessions: 40,
    findings: 0,
    critical: 0,
    completionRate: 0,
    lastActivity: "1 day ago",
  },
]

const studyStatusVariant: Record<string, "default" | "success" | "secondary"> = {
  Active: "default",
  Completed: "success",
  Draft: "secondary",
}

// --- Report detail mock data ---

const studyMeta = {
  name: "Checkout Flow Accessibility Audit",
  status: "Active" as const,
  created: "Feb 18, 2026",
  sessionsTotal: 48,
  targetSessions: 60,
}

const overviewMetrics = [
  { label: "Total Sessions", value: "48", icon: Users },
  { label: "Avg Duration", value: "14m 32s", icon: Clock },
  { label: "Completion Rate", value: "87%", icon: Target },
  { label: "Avg Friction Score", value: "6.4 / 10", icon: Zap },
]

const severityDistribution = [
  { level: "Critical", count: 3, color: "var(--color-danger)", pct: 7 },
  { level: "High", count: 9, color: "var(--color-warning)", pct: 21 },
  { level: "Medium", count: 18, color: "var(--color-info)", pct: 43 },
  { level: "Low", count: 12, color: "var(--color-text-muted)", pct: 29 },
]

const sessions = [
  { tester: "Tester-A7X", status: "Completed" as const, duration: "16m 04s", frictionScore: 7.2, completion: 100 },
  { tester: "Tester-K3B", status: "Completed" as const, duration: "12m 48s", frictionScore: 4.1, completion: 100 },
  { tester: "Tester-M9W", status: "Completed" as const, duration: "18m 22s", frictionScore: 8.6, completion: 85 },
  { tester: "Tester-D2F", status: "Processing" as const, duration: "14m 11s", frictionScore: 0, completion: 100 },
  { tester: "Tester-P5R", status: "Completed" as const, duration: "11m 33s", frictionScore: 3.8, completion: 100 },
  { tester: "Tester-J8N", status: "Completed" as const, duration: "19m 45s", frictionScore: 9.1, completion: 72 },
  { tester: "Tester-Q1L", status: "Completed" as const, duration: "13m 19s", frictionScore: 5.5, completion: 100 },
  { tester: "Tester-V6C", status: "In Progress" as const, duration: "—", frictionScore: 0, completion: 40 },
]

const sessionStatusVariant: Record<string, "success" | "info" | "warning"> = {
  Completed: "success",
  Processing: "info",
  "In Progress": "warning",
}

const findings = [
  {
    id: "F-001",
    severity: "Critical" as const,
    title: "Payment form loses focus after validation error",
    description:
      "When a validation error occurs on the payment form, keyboard focus is moved to the top of the page instead of the error message. Screen reader users and keyboard-only users must re-navigate the entire form.",
    evidenceCount: 12,
    frequency: "87% of sessions",
    confidence: 94,
  },
  {
    id: "F-002",
    severity: "Critical" as const,
    title: "Cart total not announced to screen readers after update",
    description:
      "When items are added or quantities changed, the updated cart total is not announced via ARIA live regions. Users relying on screen readers have no feedback that the action succeeded.",
    evidenceCount: 8,
    frequency: "73% of sessions",
    confidence: 91,
  },
  {
    id: "F-003",
    severity: "High" as const,
    title: "Shipping form cognitive overload — 14 fields visible simultaneously",
    description:
      "The shipping address form displays all 14 fields at once without progressive disclosure. Testers with ADHD reported feeling overwhelmed and 40% abandoned this step on first attempt.",
    evidenceCount: 15,
    frequency: "65% of sessions",
    confidence: 88,
  },
  {
    id: "F-004",
    severity: "High" as const,
    title: "Promo code field visually identical to required fields",
    description:
      "The optional promo code input uses the same styling as required fields, causing confusion. Multiple testers attempted to find a promo code before proceeding.",
    evidenceCount: 6,
    frequency: "52% of sessions",
    confidence: 82,
  },
  {
    id: "F-005",
    severity: "Medium" as const,
    title: "Insufficient colour contrast on disabled 'Place Order' button",
    description:
      "The disabled state of the Place Order button has a contrast ratio of 2.1:1 against the background, falling below WCAG AA minimum of 4.5:1.",
    evidenceCount: 4,
    frequency: "100% of sessions",
    confidence: 99,
  },
  {
    id: "F-006",
    severity: "Low" as const,
    title: "Order summary accordion animation causes motion discomfort",
    description:
      "The expand/collapse animation on the order summary section does not respect prefers-reduced-motion. One tester reported mild discomfort.",
    evidenceCount: 2,
    frequency: "8% of sessions",
    confidence: 67,
  },
]

const severityVariant: Record<string, "destructive" | "warning" | "info" | "secondary"> = {
  Critical: "destructive",
  High: "warning",
  Medium: "info",
  Low: "secondary",
}

const jiraTickets = [
  {
    id: "TICK-1",
    title: "Fix focus management after payment validation errors",
    description: "Move keyboard focus to the first validation error message when payment form validation fails.",
    priority: "Critical" as const,
    labels: ["a11y", "forms", "keyboard-nav"],
    acceptanceCriteria: [
      "Focus moves to first error message on validation failure",
      "Error message is announced by screen readers",
      "Tab order remains logical after error state",
    ],
    selected: true,
  },
  {
    id: "TICK-2",
    title: "Add ARIA live region for cart total updates",
    description: "Implement aria-live='polite' region to announce cart total changes to assistive technology.",
    priority: "Critical" as const,
    labels: ["a11y", "aria", "screen-reader"],
    acceptanceCriteria: [
      "Cart total changes announced via aria-live region",
      "Announcement includes new total amount",
      "No duplicate announcements on rapid updates",
    ],
    selected: true,
  },
  {
    id: "TICK-3",
    title: "Implement progressive disclosure for shipping form",
    description: "Break shipping form into logical steps (name, address, contact) with progressive reveal to reduce cognitive load.",
    priority: "High" as const,
    labels: ["a11y", "cognitive", "forms", "ux"],
    acceptanceCriteria: [
      "Form split into 3 logical sections",
      "Only active section expanded by default",
      "Progress indicator shows completed steps",
      "All fields remain accessible via keyboard",
    ],
    selected: true,
  },
  {
    id: "TICK-4",
    title: "Differentiate optional fields from required fields visually",
    description: "Add clear visual distinction (e.g. '(optional)' label, different styling) for optional form fields.",
    priority: "High" as const,
    labels: ["a11y", "forms", "visual"],
    acceptanceCriteria: [
      "Optional fields labelled with '(optional)' text",
      "Required fields marked with aria-required",
      "Visual styling differs between optional and required",
    ],
    selected: false,
  },
  {
    id: "TICK-5",
    title: "Fix contrast ratio on disabled Place Order button",
    description: "Increase colour contrast of disabled button state to meet WCAG AA 4.5:1 minimum.",
    priority: "Medium" as const,
    labels: ["a11y", "contrast", "wcag"],
    acceptanceCriteria: [
      "Disabled button contrast ratio >= 4.5:1",
      "Passes automated axe-core audit",
    ],
    selected: false,
  },
]

const priorityVariant: Record<string, "destructive" | "warning" | "info"> = {
  Critical: "destructive",
  High: "warning",
  Medium: "info",
}

function StudyListView() {
  const [dynamicStudies, setDynamicStudies] = useState(studiesList)

  useEffect(() => {
    api.studies.list().then((apiStudies) => {
      if (apiStudies && apiStudies.length > 0) {
        const mapped = apiStudies.map((s: any) => ({
          id: s.id,
          name: s.name,
          status: s.status === "active" || s.status === "published" ? "Active" as const : s.status === "completed" ? "Completed" as const : "Draft" as const,
          sessions: s._count?.sessions ?? 0,
          targetSessions: 60,
          findings: 0,
          critical: 0,
          completionRate: 0,
          lastActivity: new Date(s.updatedAt).toLocaleDateString(),
        }))
        setDynamicStudies([...mapped, ...studiesList])
      }
    }).catch(() => {})
  }, [])

  const activeStudies = dynamicStudies.filter((s) => s.status !== "Draft")
  const totalFindings = activeStudies.reduce((sum, s) => sum + s.findings, 0)
  const totalCritical = activeStudies.reduce((sum, s) => sum + s.critical, 0)

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <div className="mx-auto max-w-[1400px] px-6 py-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">
              Reports
            </h1>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              Select a study to view its detailed report and findings
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-[var(--radius-md)] bg-[var(--color-surface-elevated)] p-2.5">
                <FlaskConical className="h-4 w-4 text-[var(--color-accent)]" />
              </div>
              <div>
                <p className="font-display text-lg font-bold tabular-nums text-[var(--color-text-primary)]">
                  {activeStudies.length}
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">Studies with Reports</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-[var(--radius-md)] bg-[var(--color-surface-elevated)] p-2.5">
                <Bug className="h-4 w-4 text-[var(--color-warning)]" />
              </div>
              <div>
                <p className="font-display text-lg font-bold tabular-nums text-[var(--color-text-primary)]">
                  {totalFindings}
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">Total Findings</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-[var(--radius-md)] bg-[var(--color-surface-elevated)] p-2.5">
                <Shield className="h-4 w-4 text-[var(--color-danger)]" />
              </div>
              <div>
                <p className="font-display text-lg font-bold tabular-nums text-[var(--color-text-primary)]">
                  {totalCritical}
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">Critical Issues</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3">
          {dynamicStudies.map((study) => {
            const isDraft = study.status === "Draft"
            return (
              <Link
                key={study.id}
                to={isDraft ? "#" : `/business/reports/${study.id}`}
                className={cn(
                  "block",
                  isDraft && "pointer-events-none opacity-50"
                )}
              >
                <Card className="group transition-all hover:border-[var(--color-accent)]/30 hover:bg-[var(--color-surface)]/50">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] transition-colors">
                        <FlaskConical className="h-4.5 w-4.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 mb-1">
                          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                            {study.name}
                          </h3>
                          <Badge variant={studyStatusVariant[study.status]}>
                            {study.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {study.sessions}/{study.targetSessions} sessions
                          </span>
                          <span className="flex items-center gap-1">
                            <Bug className="h-3 w-3" />
                            {study.findings} findings
                          </span>
                          {study.critical > 0 && (
                            <span className="flex items-center gap-1 text-[var(--color-danger)]">
                              <Shield className="h-3 w-3" />
                              {study.critical} critical
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {study.lastActivity}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2">
                          <Progress value={study.completionRate} className="h-1.5 w-20" />
                          <span className="text-xs tabular-nums text-[var(--color-text-muted)] w-8">
                            {study.completionRate}%
                          </span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] transition-colors" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function ReportDetailView() {
  const { id: studyId } = useParams()
  const [selectedTickets, setSelectedTickets] = useState<Record<string, boolean>>(
    Object.fromEntries(jiraTickets.map((t) => [t.id, t.selected]))
  )
  const [generating, setGenerating] = useState(false)
  const [aiReport, setAiReport] = useState<any>(null)

  const toggleTicket = (id: string) => {
    setSelectedTickets((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const selectedCount = Object.values(selectedTickets).filter(Boolean).length

  const generateAiReport = async () => {
    if (!studyId) return
    setGenerating(true)
    try {
      const result = await api.agents.report(studyId)
      setAiReport(result)
    } catch (err: any) {
      console.error("Report generation failed:", err)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <div className="mx-auto max-w-[1400px] px-6 py-8">
        {/* Back link */}
        <Link
          to="/business/reports"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors"
        >
          <ChevronRight className="h-3.5 w-3.5 rotate-180" />
          Back to all studies
        </Link>

        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">
              {studyMeta.name}
            </h1>
            <Badge variant="default">{studyMeta.status}</Badge>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-sm text-[var(--color-text-secondary)]">
              Created {studyMeta.created} · {studyMeta.sessionsTotal} of {studyMeta.targetSessions} sessions completed
            </p>
            <Button size="sm" className="gap-2" onClick={generateAiReport} disabled={generating}>
              <Sparkles className="h-3.5 w-3.5" />
              {generating ? "Generating AI Report..." : "Generate AI Report"}
            </Button>
          </div>
          <Progress
            value={(studyMeta.sessionsTotal / studyMeta.targetSessions) * 100}
            className="mt-3 h-1.5 max-w-sm"
          />

          {aiReport && (
            <Card className="mt-6">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[var(--color-accent)]" />
                  <CardTitle className="text-base">AI-Generated Report</CardTitle>
                  {aiReport.overallScore !== undefined && (
                    <Badge variant={aiReport.overallScore >= 70 ? "success" : aiReport.overallScore >= 40 ? "warning" : "destructive"}>
                      Score: {aiReport.overallScore}/100
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{aiReport.summary}</p>
                {aiReport.findings?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mb-2">Findings ({aiReport.findings.length})</h4>
                    <div className="space-y-2">
                      {aiReport.findings.slice(0, 5).map((f: any, i: number) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <Badge variant={f.severity === "critical" ? "destructive" : f.severity === "high" ? "warning" : "secondary"} className="shrink-0 mt-0.5">
                            {f.severity}
                          </Badge>
                          <div>
                            <span className="font-medium text-[var(--color-text-primary)]">{f.title}</span>
                            {f.recommendation && <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{f.recommendation}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {aiReport.recommendations?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mb-2">Recommendations</h4>
                    <div className="space-y-1.5">
                      {aiReport.recommendations.map((r: any, i: number) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <Badge variant="outline" className="shrink-0 mt-0.5">{r.priority}</Badge>
                          <span className="text-[var(--color-text-secondary)]">{r.action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="findings">Findings</TabsTrigger>
            <TabsTrigger value="jira">Jira</TabsTrigger>
          </TabsList>

          {/* ====== OVERVIEW TAB ====== */}
          <TabsContent value="overview" className="space-y-6">
            {/* Executive summary */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[var(--color-accent)]" />
                  <CardTitle className="text-base">Executive Summary</CardTitle>
                </div>
                <CardDescription>AI-generated analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-[var(--radius-md)] border border-[var(--color-accent)]/10 bg-[var(--color-accent)]/[0.03] p-4 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                  <p className="mb-3">
                    The checkout flow presents <strong className="text-[var(--color-text-primary)]">significant accessibility barriers</strong> for
                    neurodiverse users, particularly in the payment and shipping form steps. The most critical issues involve
                    focus management failures and missing ARIA announcements, affecting{" "}
                    <strong className="text-[var(--color-text-primary)]">87% and 73% of test sessions</strong> respectively.
                  </p>
                  <p className="mb-3">
                    Testers with ADHD consistently reported cognitive overload at the shipping form (14 simultaneous fields),
                    leading to a <strong className="text-[var(--color-text-primary)]">40% first-attempt abandonment rate</strong> at that step.
                    Screen reader users were unable to confirm cart total updates, creating a trust gap in the purchase flow.
                  </p>
                  <p>
                    <strong className="text-[var(--color-text-primary)]">Recommended priority:</strong> Fix focus management and ARIA live regions first (critical path),
                    then implement progressive disclosure on the shipping form. These three changes are projected to reduce
                    the overall friction score from 6.4 to approximately 3.2.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Key metrics */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {overviewMetrics.map((m) => (
                <Card key={m.label}>
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="rounded-[var(--radius-md)] bg-[var(--color-surface-elevated)] p-2">
                      <m.icon className="h-4 w-4 text-[var(--color-accent)]" />
                    </div>
                    <div>
                      <p className="font-display text-lg font-bold tabular-nums text-[var(--color-text-primary)]">
                        {m.value}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)]">{m.label}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Severity distribution */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Severity Distribution</CardTitle>
                <CardDescription>
                  {severityDistribution.reduce((s, d) => s + d.count, 0)} total issues across all sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {severityDistribution.map((s) => (
                    <div key={s.level} className="flex items-center gap-4">
                      <span className="w-16 text-sm text-[var(--color-text-secondary)]">
                        {s.level}
                      </span>
                      <div className="flex-1">
                        <div className="h-6 w-full overflow-hidden rounded-[var(--radius-sm)] bg-[var(--color-surface-elevated)]">
                          <div
                            className="flex h-full items-center rounded-[var(--radius-sm)] px-2 transition-all duration-700"
                            style={{
                              width: `${Math.max(s.pct, 8)}%`,
                              backgroundColor: s.color,
                              opacity: 0.8,
                            }}
                          >
                            <span className="text-xs font-medium text-white drop-shadow-sm">
                              {s.count}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="w-10 text-right text-xs tabular-nums text-[var(--color-text-muted)]">
                        {s.pct}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ====== SESSIONS TAB ====== */}
          <TabsContent value="sessions">
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle>Sessions</CardTitle>
                  <CardDescription>{sessions.length} tester sessions</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-y border-[var(--color-border)]">
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                          Tester
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                          Duration
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                          Friction Score
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                          Completion
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border)]/50">
                      {sessions.map((s) => (
                        <tr
                          key={s.tester}
                          className="group transition-colors hover:bg-[var(--color-surface-hover)]/40"
                        >
                          <td className="px-6 py-4">
                            <span className="text-sm font-mono font-medium text-[var(--color-text-primary)]">
                              {s.tester}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={sessionStatusVariant[s.status]}>
                              {s.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-sm tabular-nums text-[var(--color-text-secondary)]">
                              {s.duration}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {s.frictionScore > 0 ? (
                              <span
                                className={cn(
                                  "text-sm font-medium tabular-nums",
                                  s.frictionScore >= 8
                                    ? "text-[var(--color-danger)]"
                                    : s.frictionScore >= 5
                                      ? "text-[var(--color-warning)]"
                                      : "text-[var(--color-success)]"
                                )}
                              >
                                {s.frictionScore.toFixed(1)}
                              </span>
                            ) : (
                              <span className="text-sm text-[var(--color-text-muted)]">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Progress value={s.completion} className="h-1.5 w-16" />
                              <span className="text-xs tabular-nums text-[var(--color-text-muted)]">
                                {s.completion}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity gap-1.5"
                              disabled={s.status !== "Completed"}
                            >
                              <FileText className="h-3.5 w-3.5" />
                              View Report
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ====== FINDINGS TAB ====== */}
          <TabsContent value="findings" className="space-y-4">
            <div className="flex gap-3 mb-4">
              <SdgBadge sdg={10} compact />
              <SdgBadge sdg={8} compact />
            </div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-[var(--color-text-secondary)]">
                {findings.length} findings detected across all sessions
              </p>
              <div className="flex items-center gap-2">
                {(["Critical", "High", "Medium", "Low"] as const).map((level) => {
                  const count = findings.filter((f) => f.severity === level).length
                  return (
                    <Badge key={level} variant={severityVariant[level]} className="gap-1">
                      {level} <span className="font-bold">{count}</span>
                    </Badge>
                  )
                })}
              </div>
            </div>

            {findings.map((finding) => (
              <Card key={finding.id} className="transition-colors hover:border-[var(--color-text-muted)]/30">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-2">
                        <Badge variant={severityVariant[finding.severity]}>
                          {finding.severity}
                        </Badge>
                        <span className="text-xs text-[var(--color-text-muted)] font-mono">
                          {finding.id}
                        </span>
                      </div>
                      <h3 className="font-display text-sm font-semibold text-[var(--color-text-primary)] mb-1.5">
                        {finding.title}
                      </h3>
                      <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-3">
                        {finding.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <FileText className="h-3 w-3 text-[var(--color-text-muted)]" />
                          <span className="text-xs text-[var(--color-text-muted)]">
                            {finding.evidenceCount} evidence clips
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="h-3 w-3 text-[var(--color-text-muted)]" />
                          <span className="text-xs text-[var(--color-text-muted)]">
                            {finding.frequency}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Shield className="h-3 w-3 text-[var(--color-text-muted)]" />
                          <span className="text-xs text-[var(--color-text-muted)]">
                            {finding.confidence}% confidence
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="shrink-0 gap-1.5">
                      <Eye className="h-3.5 w-3.5" />
                      View Evidence
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* ====== JIRA TAB ====== */}
          <TabsContent value="jira" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-base font-semibold text-[var(--color-text-primary)]">
                  Proposed Jira Tickets
                </h2>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                  AI-generated tickets based on findings. Review and approve before creating.
                </p>
              </div>
              <Button
                size="sm"
                className="gap-2"
                disabled={selectedCount === 0}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Create {selectedCount} Ticket{selectedCount !== 1 && "s"} in Jira
              </Button>
            </div>

            <div className="space-y-4">
              {jiraTickets.map((ticket) => (
                <Card
                  key={ticket.id}
                  className={cn(
                    "transition-all",
                    selectedTickets[ticket.id]
                      ? "border-[var(--color-accent)]/30 bg-[var(--color-accent)]/[0.02]"
                      : ""
                  )}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => toggleTicket(ticket.id)}
                        className="mt-0.5 shrink-0 text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
                      >
                        {selectedTickets[ticket.id] ? (
                          <CheckSquare className="h-5 w-5 text-[var(--color-accent)]" />
                        ) : (
                          <Square className="h-5 w-5" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 mb-2">
                          <Badge variant={priorityVariant[ticket.priority]}>
                            {ticket.priority}
                          </Badge>
                          <span className="text-xs font-mono text-[var(--color-text-muted)]">
                            {ticket.id}
                          </span>
                        </div>
                        <h3 className="font-display text-sm font-semibold text-[var(--color-text-primary)] mb-1">
                          {ticket.title}
                        </h3>
                        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-3">
                          {ticket.description}
                        </p>

                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {ticket.labels.map((label) => (
                            <span
                              key={label}
                              className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-text-muted)]"
                            >
                              {label}
                            </span>
                          ))}
                        </div>

                        <div className="rounded-[var(--radius-md)] border border-[var(--color-border)]/50 bg-[var(--color-surface-elevated)]/50 p-3">
                          <p className="mb-1.5 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                            Acceptance Criteria
                          </p>
                          <ul className="space-y-1">
                            {ticket.acceptanceCriteria.map((criterion, i) => (
                              <li key={i} className="flex items-start gap-2 text-xs text-[var(--color-text-secondary)]">
                                <Check className="h-3 w-3 shrink-0 mt-0.5 text-[var(--color-accent)]" />
                                {criterion}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-1.5">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-[var(--color-success)] hover:text-[var(--color-success)]">
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default function Reports() {
  const { id } = useParams()

  if (!id) {
    return <StudyListView />
  }

  return <ReportDetailView />
}
