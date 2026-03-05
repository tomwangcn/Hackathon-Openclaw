import { useEffect, useRef, useState } from "react"
import { Monitor, ScreenShare, ScreenShareOff, Loader2, ExternalLink, Copy, Check, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface WebsitePreviewProps {
  targetUrl: string | null
  onStreamReady: (stream: MediaStream) => void
  onStreamEnded: () => void
}

type Step = "show-url" | "sharing" | "ended"

export function WebsitePreview({ targetUrl, onStreamReady, onStreamEnded }: WebsitePreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null)
  const [requesting, setRequesting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [step, setStep] = useState<Step>("show-url")

  async function startScreenShare() {
    setRequesting(true)
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always" } as any,
        audio: false,
      })
      setScreenStream(stream)
      setStep("sharing")
      onStreamReady(stream)

      stream.getVideoTracks()[0].addEventListener("ended", () => {
        setScreenStream(null)
        setStep("ended")
        onStreamEnded()
      })
    } catch (err: any) {
      if (err.name !== "NotAllowedError") {
        setError("Failed to start screen sharing")
      }
    } finally {
      setRequesting(false)
    }
  }

  function copyUrl() {
    if (!targetUrl) return
    navigator.clipboard.writeText(targetUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    if (videoRef.current && screenStream) {
      videoRef.current.srcObject = screenStream
    }
  }, [screenStream])

  useEffect(() => {
    return () => {
      screenStream?.getTracks().forEach((t) => t.stop())
    }
  }, [screenStream])

  if (step === "sharing" && screenStream) {
    return (
      <div className="relative h-full w-full bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="h-full w-full object-contain"
        />
        <div className="absolute top-14 left-3 z-10">
          <Button
            variant="destructive"
            size="sm"
            className="h-7 text-xs gap-1.5 opacity-80 hover:opacity-100"
            onClick={() => {
              screenStream.getTracks().forEach((t) => t.stop())
              setScreenStream(null)
              setStep("ended")
              onStreamEnded()
            }}
          >
            <ScreenShareOff className="h-3 w-3" />
            Stop Sharing
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-[var(--color-background)]">
      <div className="text-center max-w-lg px-8">
        {/* Step 1: Show testing URL */}
        {step === "show-url" && (
          <>
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-accent)]/10 mx-auto mb-6">
              <Monitor className="h-10 w-10 text-[var(--color-accent)]" />
            </div>
            <h2 className="text-xl font-semibold font-display text-[var(--color-text-primary)] mb-2">
              Your Testing URL
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] mb-5 leading-relaxed">
              Open this website in a new tab or window, then come back here to share your screen.
            </p>

            {targetUrl ? (
              <div className="mb-6">
                <div className="flex items-center gap-2 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-[var(--radius-lg)] px-4 py-3">
                  <ExternalLink className="h-4 w-4 text-[var(--color-accent)] shrink-0" />
                  <a
                    href={targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[var(--color-accent)] font-medium truncate hover:underline flex-1 text-left"
                  >
                    {targetUrl}
                  </a>
                  <Button variant="ghost" size="sm" className="h-7 px-2 shrink-0" onClick={copyUrl}>
                    {copied ? <Check className="h-3.5 w-3.5 text-[var(--color-success)]" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                </div>
                <p className="text-xs text-[var(--color-text-muted)] mt-2">
                  Click the link to open it, or copy it to your clipboard
                </p>
              </div>
            ) : (
              <div className="mb-6 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-[var(--radius-lg)] px-4 py-3">
                <p className="text-sm text-[var(--color-text-muted)]">No target URL — open any website you'd like to test</p>
              </div>
            )}

            <Button size="lg" className="gap-2" onClick={startScreenShare} disabled={requesting}>
              {requesting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ScreenShare className="h-4 w-4" />
              )}
              {requesting ? "Waiting for permission..." : "Share Screen & Start"}
              {!requesting && <ArrowRight className="h-4 w-4" />}
            </Button>
          </>
        )}

        {/* Step 3: Sharing ended — allow restart */}
        {step === "ended" && (
          <>
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-warning)]/10 mx-auto mb-6">
              <ScreenShareOff className="h-10 w-10 text-[var(--color-warning)]" />
            </div>
            <h2 className="text-xl font-semibold font-display text-[var(--color-text-primary)] mb-2">
              Screen Sharing Stopped
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] mb-6 leading-relaxed">
              Your screen share has ended. You can restart it to continue recording.
            </p>
            {error && (
              <p className="text-sm text-[var(--color-danger)] mb-4">{error}</p>
            )}
            <Button size="lg" className="gap-2" onClick={startScreenShare} disabled={requesting}>
              {requesting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ScreenShare className="h-4 w-4" />
              )}
              {requesting ? "Waiting for permission..." : "Resume Screen Sharing"}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
