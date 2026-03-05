import { useState, useRef, useCallback, type ReactNode } from "react"
import { Minus, Plus, GripHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

interface FloatingPanelProps {
  title: string
  icon?: ReactNode
  children: ReactNode
  defaultPosition: { x: number; y: number }
  width?: number
  minimizable?: boolean
  className?: string
}

export function FloatingPanel({
  title,
  icon,
  children,
  defaultPosition,
  width = 360,
  minimizable = true,
  className,
}: FloatingPanelProps) {
  const [position, setPosition] = useState(defaultPosition)
  const [minimized, setMinimized] = useState(false)
  const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: position.x,
      startPosY: position.y,
    }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [position])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return
    const dx = e.clientX - dragRef.current.startX
    const dy = e.clientY - dragRef.current.startY
    setPosition({
      x: dragRef.current.startPosX + dx,
      y: dragRef.current.startPosY + dy,
    })
  }, [])

  const onPointerUp = useCallback(() => {
    dragRef.current = null
  }, [])

  return (
    <div
      ref={panelRef}
      className={cn(
        "fixed z-[100] rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.3)]",
        className,
      )}
      style={{
        left: position.x,
        top: position.y,
        width,
      }}
    >
      {/* Drag handle / header */}
      <div
        className="flex items-center justify-between px-3 py-2 cursor-grab active:cursor-grabbing select-none border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)]/80 rounded-t-[var(--radius-lg)]"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <div className="flex items-center gap-2">
          <GripHorizontal className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
          {icon}
          <span className="text-xs font-medium text-[var(--color-text-primary)]">{title}</span>
        </div>
        {minimizable && (
          <button
            onClick={() => setMinimized(!minimized)}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
          >
            {minimized ? <Plus className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>

      {!minimized && (
        <div className="overflow-hidden rounded-b-[var(--radius-lg)]">
          {children}
        </div>
      )}
    </div>
  )
}
