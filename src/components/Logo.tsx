import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function Logo({ className, size = "md" }: LogoProps) {
  const sizes = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  }

  const textSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
  }

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className={cn("relative", sizes[size])}>
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <rect width="40" height="40" rx="10" fill="url(#logo-grad)" />
          <circle cx="20" cy="17" r="8" stroke="white" strokeWidth="2.5" fill="none" opacity="0.9" />
          <circle cx="20" cy="17" r="3" fill="white" opacity="0.95" />
          <path d="M12 28C12 28 15 32 20 32C25 32 28 28 28 28" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
          <defs>
            <linearGradient id="logo-grad" x1="0" y1="0" x2="40" y2="40">
              <stop stopColor="#2A9D8F" />
              <stop offset="1" stopColor="#E9C46A" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <span className={cn("font-display font-bold tracking-tight text-[var(--color-text-primary)]", textSizes[size])}>
        Open<span className="text-[var(--color-gold)]">Scouter</span>
      </span>
    </div>
  )
}
