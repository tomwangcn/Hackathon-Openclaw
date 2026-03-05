import { useState, useEffect, useCallback } from "react"

export function usePipWindow() {
  const [pipWindow, setPipWindow] = useState<Window | null>(null)
  const [supported] = useState(() => "documentPictureInPicture" in window)

  const open = useCallback(async (width = 400, height = 650) => {
    if (!supported) return null

    try {
      const pip = await (window as any).documentPictureInPicture.requestWindow({
        width,
        height,
      })

      for (const sheet of document.styleSheets) {
        try {
          const rules = [...sheet.cssRules].map((r) => r.cssText).join("\n")
          const style = pip.document.createElement("style")
          style.textContent = rules
          pip.document.head.appendChild(style)
        } catch {
          if (sheet.href) {
            const link = pip.document.createElement("link")
            link.rel = "stylesheet"
            link.href = sheet.href
            pip.document.head.appendChild(link)
          }
        }
      }

      pip.document.body.style.margin = "0"
      pip.document.body.style.overflow = "hidden"

      pip.addEventListener("pagehide", () => {
        setPipWindow(null)
      })

      setPipWindow(pip)
      return pip
    } catch (err) {
      console.error("[pip] Failed to open PiP window:", err)
      return null
    }
  }, [supported])

  const close = useCallback(() => {
    pipWindow?.close()
    setPipWindow(null)
  }, [pipWindow])

  useEffect(() => {
    return () => {
      pipWindow?.close()
    }
  }, [pipWindow])

  return { pipWindow, open, close, supported }
}
