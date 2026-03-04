import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Monitor,
  Brain,
  Bug,
  ShieldCheck,
  Video,
  Bot,
  ArrowRight,
  Eye,
  BarChart3,
  Accessibility,
  Zap,
  Users,
  CheckCircle2,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"

const steps = [
  {
    num: "01",
    title: "Design Your Study",
    description:
      "Define tasks and accessibility requirements. Our AI assistant helps craft inclusive test plans — asking the right questions so you don't have to.",
    color: "var(--color-accent)",
  },
  {
    num: "02",
    title: "Real Testers, Real Sessions",
    description:
      "Neurodivergent and disabled testers use your product with AI facilitation — capturing screen, voice, gaze, and interaction data in real-time.",
    color: "var(--color-gold)",
  },
  {
    num: "03",
    title: "Actionable, Mapped Reports",
    description:
      "Receive AI-synthesized insights with WCAG 2.2 mapping, severity scores, video evidence, and one-click Jira ticket creation for your dev team.",
    color: "var(--color-orange)",
  },
]

const features = [
  {
    icon: Video,
    title: "Screen Recording",
    description: "Synchronized video, audio, and click-stream capture for every session.",
    accent: "var(--color-accent)",
  },
  {
    icon: Bot,
    title: "AI Facilitation",
    description: "Adaptive moderator that responds to tester needs and neurodiversity profiles.",
    accent: "var(--color-gold)",
  },
  {
    icon: Bug,
    title: "Jira Integration",
    description: "Auto-create tickets with severity, repro steps, and WCAG references.",
    accent: "var(--color-orange)",
  },
  {
    icon: ShieldCheck,
    title: "WCAG 2.2 Compliance",
    description: "Findings auto-mapped to success criteria with conformance tagging.",
    accent: "var(--color-coral)",
  },
  {
    icon: Brain,
    title: "Neurodiversity Insights",
    description: "Specialized analytics for ADHD, dyslexia, autism, and cognitive profiles.",
    accent: "var(--color-accent)",
  },
  {
    icon: Accessibility,
    title: "Assistive Tech Testing",
    description: "Real testing with screen readers, voice control, switch access, magnification.",
    accent: "var(--color-gold)",
  },
  {
    icon: Eye,
    title: "Gaze & Attention Maps",
    description: "AI-generated heatmaps showing where users focus and where they struggle.",
    accent: "var(--color-orange)",
  },
  {
    icon: BarChart3,
    title: "Sentiment Analysis",
    description: "Emotional response tracking through voice tone and micro-expressions.",
    accent: "var(--color-coral)",
  },
]

const logos = ["NHS England", "Ocado", "Open University", "GDS", "Notion"]

export default function Landing() {
  return (
    <div className="relative overflow-hidden">

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative min-h-[100vh] flex items-center overflow-hidden bg-[var(--color-background)]">
        {/* Warm gradient mesh */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute -top-[30%] -left-[15%] h-[700px] w-[700px] rounded-full bg-[var(--color-accent)]/[0.07] blur-[130px] animate-float-slow" />
          <div className="absolute top-[10%] -right-[10%] h-[600px] w-[600px] rounded-full bg-[var(--color-gold)]/[0.08] blur-[120px] animate-float-slower" />
          <div className="absolute -bottom-[20%] left-[30%] h-[500px] w-[500px] rounded-full bg-[var(--color-orange)]/[0.05] blur-[110px] animate-float-slow [animation-delay:3s]" />
          <div className="absolute top-[50%] left-[10%] h-[300px] w-[300px] rounded-full bg-[var(--color-coral)]/[0.04] blur-[80px] animate-float-slower [animation-delay:5s]" />
        </div>

        {/* Dot pattern — editorial */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          aria-hidden
          style={{
            backgroundImage: "radial-gradient(circle, var(--color-text-primary) 0.8px, transparent 0.8px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-6 py-32 md:py-0 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center min-h-[calc(100vh-4rem)]">
            {/* Left — copy */}
            <div className="max-w-2xl animate-fade-up">
              <div className="flex items-center gap-3 mb-8">
                <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 border-[var(--color-gold)]/20">
                  <Sparkles className="h-3 w-3 text-[var(--color-gold)]" />
                  AI-Powered Accessibility Testing
                </Badge>
              </div>

              <h1 className="font-display text-[clamp(2.8rem,6vw,5rem)] font-bold leading-[1.05] tracking-tight">
                See what{" "}
                <span className="relative inline-block">
                  <span className="relative z-10">everyone</span>
                  <span className="absolute bottom-[0.1em] left-0 right-0 h-[0.35em] bg-[var(--color-gold)]/25 rounded-full -z-0" />
                </span>
                <br />
                else{" "}
                <em className="font-normal italic text-[var(--color-gold)]">misses</em>
              </h1>

              <p className="mt-7 text-lg font-light leading-relaxed text-[var(--color-text-secondary)] max-w-lg">
                Real neurodivergent and disabled testers. AI-facilitated sessions.
                WCAG-mapped insights delivered straight to your dev workflow. No bias. No guesswork.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link to="/business/auth">
                  <Button size="xl" className="gap-2.5">
                    I'm a Business
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/tester/auth">
                  <Button variant="outline" size="xl" className="gap-2.5">
                    I'm a Tester
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="mt-12 flex items-center gap-6 text-sm font-light text-[var(--color-text-muted)]">
                {[
                  { icon: Zap, text: "5-minute setup" },
                  { icon: Monitor, text: "No code changes" },
                  { icon: ShieldCheck, text: "GDPR compliant" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-2">
                    <item.icon className="h-3.5 w-3.5 text-[var(--color-accent)]" />
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — abstract visual / floating cards */}
            <div className="relative hidden lg:block">
              <div className="relative h-[520px]">
                {/* Main card */}
                <div className="absolute top-8 left-8 right-0 rounded-[var(--radius-xl)] border border-[rgba(255,255,255,0.1)] bg-[var(--color-surface)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.4)] animate-float-slower">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-[var(--radius-md)] bg-[var(--color-accent)]/15 flex items-center justify-center">
                        <Eye className="h-4 w-4 text-[var(--color-accent)]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Live Session</p>
                        <p className="text-xs font-light text-[var(--color-text-muted)]">NHS Portal Audit</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[var(--color-coral)] animate-pulse" />
                      <span className="text-xs text-[var(--color-coral)] font-medium">REC</span>
                    </div>
                  </div>
                  <div className="rounded-[var(--radius-md)] bg-[var(--color-bg-deep)]/60 border border-[rgba(255,255,255,0.05)] h-40 flex items-center justify-center">
                    <div className="text-center">
                      <Monitor className="h-8 w-8 text-[var(--color-text-muted)] mx-auto mb-2" />
                      <p className="text-xs text-[var(--color-text-muted)]">nhs.uk/booking</p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    {["Task 1", "Task 2", "Task 3"].map((t, i) => (
                      <div key={t} className={cn(
                        "flex-1 h-1.5 rounded-full",
                        i < 2 ? "bg-[var(--color-accent)]" : "bg-[rgba(255,255,255,0.08)]"
                      )} />
                    ))}
                  </div>
                </div>

                {/* Floating AI chat card */}
                <div className="absolute -left-4 bottom-8 w-64 rounded-[var(--radius-lg)] border border-[rgba(255,255,255,0.1)] bg-[var(--color-surface-elevated)] p-4 shadow-[0_16px_48px_rgba(0,0,0,0.4)] animate-float-slow [animation-delay:2s]">
                  <div className="flex items-center gap-2 mb-3">
                    <Bot className="h-4 w-4 text-[var(--color-gold)]" />
                    <span className="text-xs font-semibold text-[var(--color-gold)]">Latch Guide</span>
                  </div>
                  <div className="space-y-2">
                    <div className="rounded-[var(--radius-md)] bg-[rgba(255,255,255,0.04)] px-3 py-2">
                      <p className="text-xs font-light text-[var(--color-text-secondary)] leading-relaxed">
                        You've been on this page for a while — what are you looking for?
                      </p>
                    </div>
                    <div className="rounded-[var(--radius-md)] bg-[var(--color-accent)]/10 px-3 py-2 ml-6">
                      <p className="text-xs font-light text-[var(--color-accent)]">
                        I can't find the booking button
                      </p>
                    </div>
                  </div>
                </div>

                {/* Floating stat card */}
                <div className="absolute right-0 bottom-20 w-48 rounded-[var(--radius-lg)] border border-[var(--color-gold)]/20 bg-[var(--color-surface)] p-4 shadow-[0_12px_32px_rgba(0,0,0,0.35)] animate-float-slow [animation-delay:4s]">
                  <p className="text-xs font-medium text-[var(--color-gold)] mb-2">Findings</p>
                  <div className="space-y-2">
                    {[
                      { label: "Critical", count: 3, color: "bg-[var(--color-coral)]" },
                      { label: "High", count: 7, color: "bg-[var(--color-orange)]" },
                      { label: "Medium", count: 12, color: "bg-[var(--color-gold)]" },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={cn("h-2 w-2 rounded-full", row.color)} />
                          <span className="text-xs font-light text-[var(--color-text-secondary)]">{row.label}</span>
                        </div>
                        <span className="text-xs font-semibold">{row.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--color-background)] to-transparent pointer-events-none" />
      </section>

      {/* ═══════════════ SOCIAL PROOF ═══════════════ */}
      <section className="relative py-16 border-y border-[rgba(255,255,255,0.06)] bg-[var(--color-surface)]">
        <div className="mx-auto max-w-5xl px-6">
          <p className="text-center text-xs uppercase tracking-[0.2em] text-[var(--color-text-muted)] mb-8 font-medium">
            Trusted by teams building for everyone
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
            {logos.map((name) => (
              <span key={name} className="text-lg font-display font-semibold text-[var(--color-text-muted)]/60 hover:text-[var(--color-text-secondary)] transition-colors cursor-default">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section id="how-it-works" className="relative py-28 md:py-36 bg-[var(--color-background)]">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-[var(--color-accent)]/[0.03] blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="max-w-xl mb-20">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-gold)] font-semibold mb-4">How it works</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold leading-[1.1] tracking-tight">
              Three steps to <em className="font-normal italic text-[var(--color-accent)]">inclusive</em> testing
            </h2>
            <p className="mt-5 text-[var(--color-text-secondary)] font-light leading-relaxed text-lg">
              From study design to actionable insights — in days, not months.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div
                key={step.num}
                className="group relative animate-fade-up"
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[rgba(255,255,255,0.08)] bg-[var(--color-surface)] p-8 transition-all duration-400 hover:border-[rgba(255,255,255,0.15)] hover:bg-[var(--color-surface-elevated)]">
                  <span
                    className="font-display text-[4.5rem] font-black leading-none tracking-tighter opacity-[0.06]"
                    style={{ color: step.color }}
                  >
                    {step.num}
                  </span>
                  <h3 className="mt-2 font-display text-xl font-semibold">{step.title}</h3>
                  <p className="mt-3 text-sm font-light leading-relaxed text-[var(--color-text-secondary)]">
                    {step.description}
                  </p>
                  <div
                    className="absolute bottom-0 left-0 h-[2px] w-0 transition-all duration-500 group-hover:w-full"
                    style={{ background: `linear-gradient(90deg, ${step.color}, transparent)` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ FEATURES ═══════════════ */}
      <section className="relative py-28 md:py-36 bg-[var(--color-surface)]">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute right-0 top-1/3 h-[500px] w-[500px] rounded-full bg-[var(--color-gold)]/[0.04] blur-[120px]" />
          <div className="absolute -left-20 bottom-1/4 h-[400px] w-[400px] rounded-full bg-[var(--color-coral)]/[0.03] blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-20 gap-6">
            <div className="max-w-xl">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-orange)] font-semibold mb-4">Features</p>
              <h2 className="font-display text-4xl md:text-5xl font-bold leading-[1.1] tracking-tight">
                Built for{" "}
                <em className="font-normal italic text-[var(--color-gold)]">real-world</em>
                {" "}accessibility
              </h2>
            </div>
            <p className="text-[var(--color-text-secondary)] font-light leading-relaxed max-w-sm">
              Every feature designed to surface the insights that automated tools simply cannot find.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-[var(--radius-xl)] border border-[rgba(255,255,255,0.08)] bg-[var(--color-surface-elevated)] p-6 transition-all duration-300 hover:border-[rgba(255,255,255,0.14)] hover:bg-[var(--color-surface-hover)] animate-fade-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: `color-mix(in srgb, ${feature.accent} 12%, transparent)` }}
                >
                  <feature.icon className="h-5 w-5" style={{ color: feature.accent }} />
                </div>
                <h3 className="mt-5 font-display text-sm font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm font-light leading-relaxed text-[var(--color-text-muted)]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ STATS BAR ═══════════════ */}
      <section className="relative border-y border-[rgba(255,255,255,0.06)] bg-[var(--color-background)]">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-0 md:divide-x md:divide-[rgba(255,255,255,0.06)]">
            {[
              { value: "2.4k+", label: "Sessions Completed", color: "var(--color-accent)" },
              { value: "340+", label: "Neurodiverse Testers", color: "var(--color-gold)" },
              { value: "98%", label: "WCAG Coverage", color: "var(--color-orange)" },
              { value: "< 48h", label: "Report Turnaround", color: "var(--color-coral)" },
            ].map((stat) => (
              <div key={stat.label} className="text-center md:px-8">
                <p className="font-display text-4xl md:text-5xl font-bold tracking-tight" style={{ color: stat.color }}>
                  {stat.value}
                </p>
                <p className="mt-2 text-sm font-light text-[var(--color-text-muted)]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ TESTIMONIAL ═══════════════ */}
      <section className="relative py-28 md:py-36 bg-[var(--color-surface)]">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="flex justify-center mb-8">
            <div className="flex -space-x-3">
              {[
                "bg-[var(--color-accent)]",
                "bg-[var(--color-gold)]",
                "bg-[var(--color-orange)]",
                "bg-[var(--color-coral)]",
              ].map((bg, i) => (
                <div key={i} className={cn(
                  "h-10 w-10 rounded-full border-2 border-[var(--color-background)] flex items-center justify-center text-xs font-semibold text-white",
                  bg
                )}>
                  {["A", "M", "S", "J"][i]}
                </div>
              ))}
              <div className="h-10 w-10 rounded-full border-2 border-[var(--color-background)] bg-[var(--color-surface-elevated)] flex items-center justify-center text-xs font-light text-[var(--color-text-muted)]">
                +12
              </div>
            </div>
          </div>
          <blockquote className="font-display text-2xl md:text-3xl font-medium leading-snug tracking-tight italic">
            "OpenScouter found 14 critical accessibility issues in our checkout flow that our automated tools
            <span className="not-italic font-bold text-[var(--color-gold)]"> completely missed</span>. The neurodivergent tester perspectives were invaluable."
          </blockquote>
          <div className="mt-8">
            <p className="text-sm font-medium">Alex Mercer</p>
            <p className="text-xs font-light text-[var(--color-text-muted)] mt-0.5">Head of Accessibility, Ocado Technology</p>
          </div>
        </div>
      </section>

      {/* ═══════════════ BOTTOM CTA ═══════════════ */}
      <section className="relative py-28 md:py-36 bg-[var(--color-background)]">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-[var(--color-gold)]/[0.06] blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2">
              {[CheckCircle2, Users, Sparkles].map((Icon, i) => (
                <div key={i} className="h-8 w-8 rounded-full bg-[rgba(255,255,255,0.06)] flex items-center justify-center">
                  <Icon className="h-4 w-4 text-[var(--color-gold)]" />
                </div>
              ))}
            </div>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold leading-[1.1] tracking-tight">
            Ready to build for{" "}
            <em className="font-normal italic text-[var(--color-gold)]">everyone</em>?
          </h2>
          <p className="mt-5 text-lg font-light text-[var(--color-text-secondary)] max-w-xl mx-auto leading-relaxed">
            Join the teams discovering what their users actually experience — and shipping products that work for all.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/business/auth">
              <Button size="xl" className="gap-2">
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="xl">
                Talk to Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
