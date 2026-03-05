import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  FlaskConical,
  Users,
  TrendingUp,
  TrendingDown,
  Bug,
  FileCheck,
  Loader2,
  Clock,
  ArrowRight,
  BarChart3,
  Plus,
  ChevronRight,
  Eye,
  AlertTriangle,
} from "lucide-react"

const stats = [
  {
    label: "Active Studies",
    value: "7",
    icon: FlaskConical,
    trend: "+2",
    trendUp: true,
    subtitle: "from last month",
  },
  {
    label: "Total Sessions",
    value: "284",
    icon: Users,
    trend: "+18%",
    trendUp: true,
    subtitle: "from last month",
  },
  {
    label: "Avg Completion Rate",
    value: "87.3%",
    icon: BarChart3,
    trend: "+4.2%",
    trendUp: true,
    subtitle: "from last month",
  },
  {
    label: "Issues Found",
    value: "42",
    icon: Bug,
    trend: "+11",
    trendUp: false,
    subtitle: "critical & high severity",
  },
]

const alerts = [
  {
    icon: Loader2,
    iconClass: "text-[var(--color-info)] animate-spin",
    bgClass: "bg-[var(--color-info)]/5 border-[var(--color-info)]/20",
    title: "3 sessions processing",
    description: "AI analysis in progress for \"Checkout Flow v2\" study",
    action: "View Status",
  },
  {
    icon: FileCheck,
    iconClass: "text-[var(--color-success)]",
    bgClass: "bg-[var(--color-success)]/5 border-[var(--color-success)]/20",
    title: "2 reports ready",
    description: "New reports available for \"Onboarding Redesign\" and \"Search UX\"",
    action: "View Reports",
  },
  {
    icon: AlertTriangle,
    iconClass: "text-[var(--color-danger)]",
    bgClass: "bg-[var(--color-danger)]/5 border-[var(--color-danger)]/20",
    title: "High severity issue detected",
    description: "Screen reader navigation failure in \"Payment Form\" study",
    action: "View Issue",
  },
]

const recentStudies = [
  {
    name: "Checkout Flow v2",
    status: "Active" as const,
    sessions: 48,
    completionRate: 91,
    lastActivity: "12 min ago",
  },
  {
    name: "Onboarding Redesign",
    status: "Completed" as const,
    sessions: 62,
    completionRate: 84,
    lastActivity: "2 hours ago",
  },
  {
    name: "Search UX Improvements",
    status: "Active" as const,
    sessions: 31,
    completionRate: 78,
    lastActivity: "45 min ago",
  },
  {
    name: "Mobile Navigation",
    status: "Draft" as const,
    sessions: 0,
    completionRate: 0,
    lastActivity: "1 day ago",
  },
  {
    name: "Form Accessibility Audit",
    status: "Active" as const,
    sessions: 19,
    completionRate: 95,
    lastActivity: "3 hours ago",
  },
  {
    name: "Dashboard Usability",
    status: "Completed" as const,
    sessions: 55,
    completionRate: 88,
    lastActivity: "5 days ago",
  },
]

const statusVariant: Record<string, "default" | "success" | "secondary"> = {
  Active: "default",
  Completed: "success",
  Draft: "secondary",
}

export default function Dashboard() {
  const location = useLocation()
  const [studies, setStudies] = useState(recentStudies)
  const [showBanner, setShowBanner] = useState(false)
  const [newStudyName, setNewStudyName] = useState("")

  useEffect(() => {
    api.studies.list().then((apiStudies) => {
      const mapped = apiStudies.map((s: any) => ({
        name: s.name as string,
        status: (s.status === "active" ? "Active" : s.status === "published" ? "Active" : s.status === "completed" ? "Completed" : "Draft") as "Active" | "Completed" | "Draft",
        sessions: (s._count?.sessions ?? 0) as number,
        completionRate: 0,
        lastActivity: new Date(s.updatedAt).toLocaleDateString(),
      }))
      if (mapped.length > 0) setStudies(mapped)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    const state = location.state as { newStudy?: { name: string; tasks: number; focusAreas: string[] } } | null
    if (state?.newStudy) {
      const created: (typeof recentStudies)[number] = {
        name: state.newStudy.name,
        status: "Active",
        sessions: 0,
        completionRate: 0,
        lastActivity: "Just now",
      }
      setStudies((prev) => [created, ...prev])
      setNewStudyName(state.newStudy.name)
      setShowBanner(true)
      window.history.replaceState({}, "")
    }
  }, [location.state])

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <div className="mx-auto max-w-[1400px] px-6 py-8">
        {/* Page header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              Overview of your accessibility testing programme
            </p>
          </div>
          <Link to="/business/studies/new">
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              New Study
            </Button>
          </Link>
        </div>

        {/* Published banner */}
        {showBanner && (
          <div className="mb-6 flex items-center justify-between rounded-[var(--radius-lg)] border border-[var(--color-success)]/30 bg-[var(--color-success)]/5 px-5 py-4 animate-fade-up">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-success)]/10">
                <FlaskConical className="h-4 w-4 text-[var(--color-success)]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  Study published successfully!
                </p>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  &ldquo;{newStudyName}&rdquo; is now live and ready for testers.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowBanner(false)}
              className="text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label} className="group relative overflow-hidden transition-colors hover:border-[var(--color-text-muted)]/50">
              <div className="absolute top-0 right-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-[var(--color-accent)]/[0.03] blur-2xl transition-all group-hover:bg-[var(--color-accent)]/[0.06]" />
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="rounded-[var(--radius-md)] bg-[var(--color-surface-elevated)] p-2.5">
                    <stat.icon className="h-4.5 w-4.5 text-[var(--color-accent)]" />
                  </div>
                  <div
                    className={cn(
                      "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                      stat.trendUp
                        ? "bg-[var(--color-success)]/10 text-[var(--color-success)]"
                        : "bg-[var(--color-danger)]/10 text-[var(--color-danger)]"
                    )}
                  >
                    {stat.trendUp ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {stat.trend}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="font-display text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">
                    {stat.value}
                  </p>
                  <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">
                    {stat.label}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Alerts */}
        <div className="mb-8 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-[var(--color-text-primary)]">
              Alerts
            </h2>
            <span className="text-xs text-[var(--color-text-muted)]">
              {alerts.length} notifications
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {alerts.map((alert) => (
              <div
                key={alert.title}
                className={cn(
                  "flex flex-col gap-3 rounded-[var(--radius-lg)] border p-4 transition-colors hover:bg-[var(--color-surface-hover)]/30",
                  alert.bgClass
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    <alert.icon className={cn("h-4 w-4", alert.iconClass)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">
                      {alert.title}
                    </p>
                    <p className="mt-1 text-xs text-[var(--color-text-secondary)] leading-relaxed">
                      {alert.description}
                    </p>
                  </div>
                </div>
                <button className="self-start text-xs font-medium text-[var(--color-accent)] hover:underline underline-offset-2 transition-colors flex items-center gap-1">
                  {alert.action}
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Studies table */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle>Recent Studies</CardTitle>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                Your latest accessibility testing studies
              </p>
            </div>
            <Link to="/business/studies">
              <Button variant="ghost" size="sm" className="gap-1.5">
                View All
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-y border-[var(--color-border)]">
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                      Study Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                      Sessions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                      Completion
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                      Last Activity
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]/50">
                  {studies.map((study, idx) => (
                    <tr
                      key={study.name + idx}
                      className={cn(
                        "group transition-colors hover:bg-[var(--color-surface-hover)]/40",
                        study.lastActivity === "Just now" && "bg-[var(--color-success)]/[0.03]"
                      )}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] transition-colors">
                            <FlaskConical className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-sm font-medium text-[var(--color-text-primary)]">
                            {study.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={statusVariant[study.status]}>
                          {study.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm tabular-nums text-[var(--color-text-secondary)]">
                          {study.sessions}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Progress
                            value={study.completionRate}
                            className="h-1.5 w-20"
                          />
                          <span className="text-xs tabular-nums text-[var(--color-text-muted)]">
                            {study.completionRate}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 text-xs text-[var(--color-text-muted)]">
                          <Clock className="h-3 w-3" />
                          {study.lastActivity}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity gap-1.5"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Quick metrics footer */}
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: "Avg Session Duration", value: "14m 32s" },
            { label: "Tester Satisfaction", value: "4.6 / 5" },
            { label: "Issues Resolved", value: "28 / 42" },
            { label: "Reports Generated", value: "19" },
          ].map((metric) => (
            <div
              key={metric.label}
              className="rounded-[var(--radius-md)] border border-[var(--color-border)]/50 bg-[var(--color-surface)]/50 px-4 py-3"
            >
              <p className="text-lg font-display font-semibold tabular-nums text-[var(--color-text-primary)]">
                {metric.value}
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">
                {metric.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
