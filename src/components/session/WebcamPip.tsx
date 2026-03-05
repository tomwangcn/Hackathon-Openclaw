import { useRef, useEffect } from "react"
import { Camera, CameraOff, Sun, CircleDot } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const EMOTION_EMOJI: Record<string, string> = {
  happy: "😊",
  sad: "😢",
  angry: "😠",
  surprise: "😲",
  fear: "😨",
  disgust: "🤢",
  neutral: "😐",
}

interface WebcamPipProps {
  stream: MediaStream | null
  cameraOn: boolean
  setCameraOn: (on: boolean) => void
  recording: "idle" | "recording" | "paused"
  currentEmotion: { dominant: string; emotions: Record<string, number> } | null
  videoRef: React.RefObject<HTMLVideoElement | null>
}

export function WebcamPip({ stream, cameraOn, setCameraOn, recording, currentEmotion, videoRef }: WebcamPipProps) {
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream, cameraOn, videoRef])

  return (
    <div>
      <div className={cn(
        "w-[240px] rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden",
        cameraOn ? "bg-[var(--color-surface)]" : "bg-[var(--color-background)]"
      )}>
        <div className={cn(
          "h-[160px] flex items-center justify-center overflow-hidden",
          cameraOn ? "bg-black" : "bg-[var(--color-background)]"
        )}>
          {cameraOn && stream ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover mirror"
              style={{ transform: "scaleX(-1)" }}
            />
          ) : (
            <div className="text-center">
              <CameraOff className="h-6 w-6 text-[var(--color-text-muted)]/40 mx-auto mb-1" />
              <p className="text-[10px] text-[var(--color-text-muted)]">
                {stream ? "Camera off" : "No camera access"}
              </p>
            </div>
          )}
        </div>
        <div className="px-2.5 py-1.5 border-t border-[var(--color-border)] bg-[var(--color-surface-elevated)]/80 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px]">
            {currentEmotion ? (
              <span className="flex items-center gap-1">
                <span>{EMOTION_EMOJI[currentEmotion.dominant] || "😐"}</span>
                <span className="text-[var(--color-text-secondary)] capitalize">{currentEmotion.dominant}</span>
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Sun className="h-2.5 w-2.5 text-[var(--color-success)]" />
                <span className="text-[var(--color-text-muted)]">Analyzing...</span>
              </span>
            )}
            {recording === "recording" && (
              <Badge variant="destructive" className="text-[8px] h-3.5 gap-0.5 px-1 animate-pulse">
                <CircleDot className="h-1.5 w-1.5" />
                REC
              </Badge>
            )}
          </div>
          <button
            onClick={() => {
              if (stream) {
                stream.getVideoTracks().forEach((t) => { t.enabled = !cameraOn })
                setCameraOn(!cameraOn)
              }
            }}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
          >
            {cameraOn ? <Camera className="h-3 w-3" /> : <CameraOff className="h-3 w-3" />}
          </button>
        </div>
      </div>
    </div>
  )
}
