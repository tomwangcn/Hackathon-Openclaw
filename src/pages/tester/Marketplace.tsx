import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "@/lib/api"
import {
  Search,
  Monitor,
  Mic,
  Camera,
  Clock,
  PoundSterling,
  Sparkles,
  Shield,
  CheckCircle2,
  Eye,
  ChevronRight,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

type CaptureType = "screen" | "audio" | "webcam"
type FocusArea = "Navigation" | "Forms" | "Reading" | "Cognitive Load" | "Motor" | "Visual"

interface MockTest {
  id: string
  title: string
  business: string
  description: string
  category: string
  duration: number
  capture: CaptureType[]
  focusAreas: FocusArea[]
  reward: number
  tasks: string[]
  consent: string[]
  privacy: string
  retention: string
  deviceReq: string
}

const MOCK_TESTS: MockTest[] = [
  {
    id: "t1",
    title: "NHS Digital Portal Navigation Audit",
    business: "NHS England",
    description:
      "Evaluate the appointment booking flow for screen reader compatibility and cognitive accessibility across patient-facing pages.",
    category: "Healthcare",
    duration: 45,
    capture: ["screen", "audio", "webcam"],
    focusAreas: ["Navigation", "Cognitive Load", "Reading"],
    reward: 35,
    tasks: [
      "Navigate to the appointment booking page",
      "Search for a GP in your area using the search bar",
      "Select a time slot and complete the booking form",
      "Attempt to reschedule the appointment",
      "Locate the prescription repeat request section",
    ],
    consent: [
      "Screen recording of the testing session",
      "Audio recording of think-aloud narration",
      "Webcam feed for facial expression analysis",
      "Session interaction data (clicks, scrolls, pauses)",
    ],
    privacy:
      "All data is anonymised before processing. Facial data is processed locally and only emotional valence scores are stored. Raw video is deleted within 48 hours.",
    retention: "90 days",
    deviceReq: "Desktop",
  },
  {
    id: "t2",
    title: "Checkout Flow Usability Study",
    business: "Ocado Technology",
    description:
      "Test the end-to-end grocery checkout experience focusing on form accessibility and error recovery patterns.",
    category: "E-commerce",
    duration: 30,
    capture: ["screen", "audio"],
    focusAreas: ["Forms", "Navigation"],
    reward: 25,
    tasks: [
      "Add 3 items to your basket from the homepage",
      "Proceed to checkout",
      "Fill in delivery address details",
      "Apply a discount code (TESTCODE10)",
      "Complete the mock payment flow",
    ],
    consent: [
      "Screen recording of the testing session",
      "Audio recording of think-aloud narration",
      "Session interaction data (clicks, scrolls, pauses)",
    ],
    privacy:
      "Session data is encrypted at rest. No personal details from form entries are stored — only interaction patterns.",
    retention: "60 days",
    deviceReq: "Desktop / Tablet",
  },
  {
    id: "t3",
    title: "Student Dashboard Cognitive Load Test",
    business: "Open University",
    description:
      "Measure cognitive load during assignment submission and grade review workflows with eye-tracking correlation data.",
    category: "Education",
    duration: 60,
    capture: ["screen", "webcam"],
    focusAreas: ["Cognitive Load", "Reading", "Navigation"],
    reward: 45,
    tasks: [
      "Log in and navigate to your current module",
      "Find and open an upcoming assignment",
      "Upload a mock submission file",
      "Navigate to the grades section",
      "Review feedback on a previous assignment",
      "Locate the discussion forum for your module",
    ],
    consent: [
      "Screen recording of the testing session",
      "Webcam feed for gaze tracking approximation",
      "Pupil dilation estimates via webcam",
      "Task completion timing data",
    ],
    privacy:
      "Webcam data is processed via on-device ML models. Only aggregated attention metrics are transmitted. No facial images leave your device.",
    retention: "120 days",
    deviceReq: "Desktop",
  },
  {
    id: "t4",
    title: "GOV.UK Benefits Application Form Review",
    business: "Government Digital Service",
    description:
      "Assess the Universal Credit application form for neurodivergent users — focusing on reading level, form complexity, and motor demands.",
    category: "Government",
    duration: 40,
    capture: ["screen", "audio", "webcam"],
    focusAreas: ["Forms", "Reading", "Motor", "Cognitive Load"],
    reward: 30,
    tasks: [
      "Begin the Universal Credit application",
      "Complete the personal details section",
      "Navigate the housing costs questionnaire",
      "Upload a mock identity document",
      "Review and submit the application",
    ],
    consent: [
      "Screen recording of the testing session",
      "Audio narration recording",
      "Webcam feed for emotional response tracking",
      "Mouse movement and keystroke timing patterns",
    ],
    privacy:
      "All data processed under UK GDPR guidelines. Keystroke data captures timing only — no actual key values are recorded.",
    retention: "90 days",
    deviceReq: "Desktop",
  },
  {
    id: "t5",
    title: "SaaS Onboarding Wizard Evaluation",
    business: "Notion Labs",
    description:
      "Evaluate the first-time user onboarding experience for accessibility barriers and cognitive overwhelm points.",
    category: "SaaS",
    duration: 25,
    capture: ["screen"],
    focusAreas: ["Navigation", "Cognitive Load"],
    reward: 20,
    tasks: [
      "Create a new workspace",
      "Follow the onboarding wizard steps",
      "Create your first page using a template",
      "Invite a mock team member",
    ],
    consent: [
      "Screen recording of the testing session",
      "Click and scroll interaction data",
    ],
    privacy:
      "Minimal data collection — screen recording only. All recordings are stored in encrypted UK-based servers.",
    retention: "30 days",
    deviceReq: "Desktop / Mobile",
  },
  {
    id: "t6",
    title: "Healthcare Booking App — Mobile",
    business: "Babylon Health",
    description:
      "Test the mobile appointment booking and symptom checker flows with a focus on touch target sizes and visual accessibility.",
    category: "Healthcare",
    duration: 35,
    capture: ["screen", "audio"],
    focusAreas: ["Navigation", "Visual", "Motor"],
    reward: 28,
    tasks: [
      "Open the app and register a new account",
      "Complete the symptom checker flow",
      "Book a video consultation",
      "Navigate to your medical records",
      "Cancel the booked appointment",
    ],
    consent: [
      "Screen recording of the testing session",
      "Audio recording of think-aloud narration",
      "Touch interaction pattern data",
    ],
    privacy:
      "Touch data captures position and timing only. No biometric data is collected. All data deleted after analysis.",
    retention: "45 days",
    deviceReq: "Mobile",
  },
]

const captureIcons: Record<CaptureType, { icon: typeof Monitor; label: string }> = {
  screen: { icon: Monitor, label: "Screen" },
  audio: { icon: Mic, label: "Audio" },
  webcam: { icon: Camera, label: "Webcam" },
}

const focusAreaColors: Record<string, string> = {
  Navigation: "bg-[var(--color-info)]/10 text-[var(--color-info)] border-[var(--color-info)]/20",
  Forms: "bg-[var(--color-accent)]/10 text-[var(--color-accent)] border-[var(--color-accent)]/20",
  Reading: "bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-[var(--color-warning)]/20",
  "Cognitive Load": "bg-[var(--color-danger)]/10 text-[var(--color-danger)] border-[var(--color-danger)]/20",
  Motor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Visual: "bg-pink-500/10 text-pink-400 border-pink-500/20",
}

export default function Marketplace() {
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<string>("all")
  const [duration, setDuration] = useState<string>("all")
  const [captureFilter, setCaptureFilter] = useState<string>("all")
  const [deviceFilter, setDeviceFilter] = useState<string>("all")
  const [selectedTest, setSelectedTest] = useState<MockTest | null>(null)
  const [allTests, setAllTests] = useState<MockTest[]>(MOCK_TESTS)
  const [accepting, setAccepting] = useState(false)

  useEffect(() => {
    api.marketplace.list().then((apiStudies) => {
      if (apiStudies && apiStudies.length > 0) {
        const mapped: MockTest[] = apiStudies.map((s: any) => ({
          id: s.id,
          title: s.name,
          business: s.org?.name || "Unknown",
          description: s.goal || "",
          category: (s.focusAreas as string[])?.[0] || "General",
          duration: s.estimatedMinutes || 30,
          capture: [
            "screen" as CaptureType,
            ...(s.captureAudio ? ["audio" as CaptureType] : []),
            ...(s.captureWebcam ? ["webcam" as CaptureType] : []),
          ],
          focusAreas: (s.focusAreas || []) as FocusArea[],
          reward: s.reward ?? 25,
          tasks: (s.tasks || []).map((t: any) => t.title),
          consent: ["Screen recording of the testing session"],
          privacy: "Data processed under GDPR guidelines.",
          retention: "90 days",
          deviceReq: "Desktop",
        }))
        setAllTests([...mapped, ...MOCK_TESTS])
      }
    }).catch(() => {})
  }, [])

  const handleAccept = async (test: MockTest) => {
    setAccepting(true)
    try {
      await api.marketplace.accept(test.id)
      setSelectedTest(null)
      navigate("/tester/dashboard")
    } catch {
      setSelectedTest(null)
      navigate(`/tester/session/${test.id}`)
    } finally {
      setAccepting(false)
    }
  }

  const filtered = allTests.filter((t) => {
    if (category !== "all" && t.category !== category) return false
    if (duration === "short" && t.duration > 30) return false
    if (duration === "medium" && (t.duration <= 30 || t.duration > 45)) return false
    if (duration === "long" && t.duration <= 45) return false
    if (captureFilter !== "all" && !t.capture.includes(captureFilter as CaptureType)) return false
    if (deviceFilter !== "all" && !t.deviceReq.toLowerCase().includes(deviceFilter.toLowerCase())) return false
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.business.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Header */}
      <div className="border-b border-[var(--color-border)]">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-5 w-5 text-[var(--color-accent)]" />
            <h1 className="font-display text-2xl font-bold">Test Marketplace</h1>
          </div>
          <p className="text-[var(--color-text-secondary)] text-sm max-w-xl">
            Browse available accessibility and usability studies. Accept tests that match your profile and device setup.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)]/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-6 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
              <Input
                placeholder="Search studies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-[var(--color-surface-elevated)] border-[var(--color-border)]"
              />
            </div>

            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[160px] bg-[var(--color-surface-elevated)]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="E-commerce">E-commerce</SelectItem>
                <SelectItem value="SaaS">SaaS</SelectItem>
                <SelectItem value="Healthcare">Healthcare</SelectItem>
                <SelectItem value="Education">Education</SelectItem>
                <SelectItem value="Government">Government</SelectItem>
              </SelectContent>
            </Select>

            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger className="w-[150px] bg-[var(--color-surface-elevated)]">
                <SelectValue placeholder="Duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Duration</SelectItem>
                <SelectItem value="short">&le; 30 min</SelectItem>
                <SelectItem value="medium">30–45 min</SelectItem>
                <SelectItem value="long">45+ min</SelectItem>
              </SelectContent>
            </Select>

            <Select value={captureFilter} onValueChange={setCaptureFilter}>
              <SelectTrigger className="w-[160px] bg-[var(--color-surface-elevated)]">
                <SelectValue placeholder="Capture" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Capture</SelectItem>
                <SelectItem value="screen">Screen Only</SelectItem>
                <SelectItem value="audio">Audio Required</SelectItem>
                <SelectItem value="webcam">Webcam Required</SelectItem>
              </SelectContent>
            </Select>

            <Select value={deviceFilter} onValueChange={setDeviceFilter}>
              <SelectTrigger className="w-[150px] bg-[var(--color-surface-elevated)]">
                <SelectValue placeholder="Device" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Device</SelectItem>
                <SelectItem value="desktop">Desktop</SelectItem>
                <SelectItem value="mobile">Mobile</SelectItem>
                <SelectItem value="tablet">Tablet</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-[var(--color-text-secondary)]">
            <span className="text-[var(--color-text-primary)] font-medium">{filtered.length}</span> studies available
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((test) => (
            <TestCard key={test.id} test={test} onViewDetails={() => setSelectedTest(test)} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <Search className="h-10 w-10 text-[var(--color-text-muted)] mx-auto mb-4" />
            <p className="text-[var(--color-text-secondary)] font-medium">No studies match your filters</p>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">Try adjusting your search criteria</p>
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedTest} onOpenChange={(open) => !open && setSelectedTest(null)}>
        {selectedTest && (
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs">{selectedTest.category}</Badge>
                <Badge variant="secondary" className="text-xs gap-1">
                  <Clock className="h-3 w-3" />
                  {selectedTest.duration} min
                </Badge>
              </div>
              <DialogTitle className="text-xl">{selectedTest.title}</DialogTitle>
              <DialogDescription>{selectedTest.business}</DialogDescription>
            </DialogHeader>

            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-6 pb-2">
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  {selectedTest.description}
                </p>

                {/* Tasks */}
                <div>
                  <h4 className="font-display text-sm font-semibold mb-3 flex items-center gap-2">
                    <Eye className="h-4 w-4 text-[var(--color-accent)]" />
                    Task Overview
                  </h4>
                  <div className="space-y-2">
                    {selectedTest.tasks.map((task, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 rounded-[var(--radius-md)] bg-[var(--color-surface-elevated)] px-3.5 py-2.5 text-sm"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-xs font-bold mt-0.5">
                          {i + 1}
                        </span>
                        <span className="text-[var(--color-text-secondary)]">{task}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Capture Requirements */}
                <div>
                  <h4 className="font-display text-sm font-semibold mb-3">Capture Requirements</h4>
                  <div className="flex gap-3">
                    {(["screen", "audio", "webcam"] as CaptureType[]).map((type) => {
                      const active = selectedTest.capture.includes(type)
                      const { icon: Icon, label } = captureIcons[type]
                      return (
                        <div
                          key={type}
                          className={cn(
                            "flex items-center gap-2 rounded-[var(--radius-md)] border px-3 py-2 text-xs font-medium",
                            active
                              ? "border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 text-[var(--color-accent)]"
                              : "border-[var(--color-border)] text-[var(--color-text-muted)] opacity-50"
                          )}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {label}
                          {active && <CheckCircle2 className="h-3 w-3" />}
                        </div>
                      )
                    })}
                  </div>
                </div>

                <Separator />

                {/* Consent */}
                <div>
                  <h4 className="font-display text-sm font-semibold mb-3 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-[var(--color-warning)]" />
                    Consent Requirements
                  </h4>
                  <ul className="space-y-1.5">
                    {selectedTest.consent.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                        <ChevronRight className="h-3 w-3 text-[var(--color-text-muted)] shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />

                {/* Privacy */}
                <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4 space-y-3">
                  <h4 className="font-display text-sm font-semibold flex items-center gap-2">
                    <Shield className="h-4 w-4 text-[var(--color-success)]" />
                    Privacy &amp; Data Handling
                  </h4>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                    {selectedTest.privacy}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                    <Clock className="h-3 w-3" />
                    Data retention window: <span className="text-[var(--color-text-secondary)] font-medium">{selectedTest.retention}</span>
                  </div>
                </div>
              </div>
            </ScrollArea>

            <DialogFooter className="flex-row items-center justify-between border-t border-[var(--color-border)] pt-4 mt-2">
              <div className="flex items-center gap-1.5">
                <PoundSterling className="h-5 w-5 text-[var(--color-accent)]" />
                <span className="text-xl font-display font-bold text-[var(--color-text-primary)]">
                  £{selectedTest.reward}
                </span>
                <span className="text-xs text-[var(--color-text-muted)] ml-1">reward</span>
              </div>
              <Button size="lg" className="gap-2" disabled={accepting} onClick={() => handleAccept(selectedTest)}>
                {accepting ? "Accepting..." : "Accept Test"}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}

function TestCard({ test, onViewDetails }: { test: MockTest; onViewDetails: () => void }) {
  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:border-[var(--color-text-muted)]/50 hover:shadow-[0_8px_40px_rgba(0,212,170,0.06)] hover:-translate-y-0.5">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent)]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <CardContent className="p-5 space-y-4">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-[var(--color-text-muted)] font-medium uppercase tracking-wider">
              {test.business}
            </span>
            <Badge variant="outline" className="text-[10px] px-2 py-0">
              {test.category}
            </Badge>
          </div>
          <h3 className="font-display font-semibold text-[var(--color-text-primary)] leading-snug line-clamp-1">
            {test.title}
          </h3>
        </div>

        {/* Description */}
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed line-clamp-2">
          {test.description}
        </p>

        {/* Meta row */}
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="gap-1 text-xs">
            <Clock className="h-3 w-3" />
            {test.duration} min
          </Badge>

          <div className="flex items-center gap-1.5">
            {(["screen", "audio", "webcam"] as CaptureType[]).map((type) => {
              const active = test.capture.includes(type)
              const { icon: Icon, label } = captureIcons[type]
              return (
                <div
                  key={type}
                  title={`${label}: ${active ? "Required" : "Not required"}`}
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-md transition-colors",
                    active
                      ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                      : "bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)]"
                  )}
                >
                  <Icon className="h-3 w-3" />
                </div>
              )
            })}
          </div>
        </div>

        {/* Focus areas */}
        <div className="flex flex-wrap gap-1.5">
          {test.focusAreas.map((area) => (
            <span
              key={area}
              className={cn(
                "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium",
                focusAreaColors[area] || "bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)]"
              )}
            >
              {area}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-[var(--color-border)]/50">
          <div className="flex items-center gap-1">
            <PoundSterling className="h-4 w-4 text-[var(--color-accent)]" />
            <span className="font-display font-bold text-lg text-[var(--color-text-primary)]">
              £{test.reward}
            </span>
          </div>
          <Button variant="ghost" size="sm" className="gap-1 text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]" onClick={onViewDetails}>
            View Details
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
