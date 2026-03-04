import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[var(--color-gold)] text-[var(--color-bg-deep)]",
        secondary: "border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.06)] text-[var(--color-text-secondary)]",
        outline: "border-[rgba(244,241,234,0.2)] text-[var(--color-text-secondary)]",
        destructive: "border-transparent bg-[var(--color-coral)]/15 text-[var(--color-coral)]",
        warning: "border-transparent bg-[var(--color-orange)]/15 text-[var(--color-orange)]",
        success: "border-transparent bg-[var(--color-accent)]/15 text-[var(--color-accent)]",
        info: "border-transparent bg-[var(--color-gold)]/15 text-[var(--color-gold)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
