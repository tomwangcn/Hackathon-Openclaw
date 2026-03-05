import { useEffect, useRef, useCallback } from "react"
import { api } from "@/lib/api"

export interface InteractionEvent {
  type: "click" | "mousemove" | "rage_click" | "freeze" | "misclick"
  x: number
  y: number
  timestamp: number
  meta?: Record<string, any>
}

interface TrackerState {
  clicks: { x: number; y: number; t: number }[]
  lastMoveTime: number
  freezeTimer: ReturnType<typeof setTimeout> | null
  isFrozen: boolean
  eventBuffer: InteractionEvent[]
}

const RAGE_CLICK_THRESHOLD = 3
const RAGE_CLICK_WINDOW_MS = 1500
const RAGE_CLICK_RADIUS = 50
const FREEZE_THRESHOLD_MS = 5000
const FLUSH_INTERVAL_MS = 5000

function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

export function useMouseTracker(sessionId: string | undefined, active: boolean) {
  const state = useRef<TrackerState>({
    clicks: [],
    lastMoveTime: Date.now(),
    freezeTimer: null,
    isFrozen: false,
    eventBuffer: [],
  })

  const pushEvent = useCallback((event: InteractionEvent) => {
    state.current.eventBuffer.push(event)
  }, [])

  const flush = useCallback(async () => {
    if (!sessionId || state.current.eventBuffer.length === 0) return
    const batch = state.current.eventBuffer.splice(0)
    try {
      await api.interactions.sendBatch(sessionId, batch)
    } catch {
      state.current.eventBuffer.unshift(...batch)
    }
  }, [sessionId])

  useEffect(() => {
    if (!active || !sessionId) return

    const s = state.current
    s.lastMoveTime = Date.now()

    function resetFreezeTimer() {
      if (s.freezeTimer) clearTimeout(s.freezeTimer)
      if (s.isFrozen) {
        s.isFrozen = false
      }
      s.freezeTimer = setTimeout(() => {
        s.isFrozen = true
        pushEvent({
          type: "freeze",
          x: 0,
          y: 0,
          timestamp: Date.now(),
          meta: { durationMs: FREEZE_THRESHOLD_MS },
        })
      }, FREEZE_THRESHOLD_MS)
    }

    function onMouseMove(e: MouseEvent) {
      s.lastMoveTime = Date.now()
      resetFreezeTimer()
    }

    function onClick(e: MouseEvent) {
      const now = Date.now()
      const click = { x: e.clientX, y: e.clientY, t: now }

      pushEvent({ type: "click", x: click.x, y: click.y, timestamp: now })

      s.clicks.push(click)
      s.clicks = s.clicks.filter((c) => now - c.t < RAGE_CLICK_WINDOW_MS)

      const nearby = s.clicks.filter((c) => dist(c, click) < RAGE_CLICK_RADIUS)
      if (nearby.length >= RAGE_CLICK_THRESHOLD) {
        pushEvent({
          type: "rage_click",
          x: click.x,
          y: click.y,
          timestamp: now,
          meta: { clickCount: nearby.length, windowMs: RAGE_CLICK_WINDOW_MS },
        })
        s.clicks = []
      }

      const target = e.target as HTMLElement
      const interactive = target.closest("a, button, input, select, textarea, [role='button'], [onclick]")
      if (!interactive) {
        pushEvent({
          type: "misclick",
          x: click.x,
          y: click.y,
          timestamp: now,
          meta: { tagName: target.tagName, className: target.className?.toString().slice(0, 100) },
        })
      }

      resetFreezeTimer()
    }

    document.addEventListener("mousemove", onMouseMove, { passive: true })
    document.addEventListener("click", onClick, true)
    resetFreezeTimer()

    const flushInterval = setInterval(flush, FLUSH_INTERVAL_MS)

    return () => {
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("click", onClick, true)
      if (s.freezeTimer) clearTimeout(s.freezeTimer)
      clearInterval(flushInterval)
      flush()
    }
  }, [active, sessionId, pushEvent, flush])

  return { flush }
}
