import type { ReactNode } from 'react'

type BadgeVariant = 'neutral' | 'success' | 'warning' | 'danger'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
}

/**
 * Small status pill — "Open", "Full", "5v5", "Closing soon".
 *
 * The design brief (docs/03-uiux-design-brief.md) asks for status to be
 * readable in under a second, which is what colour-coded badges buy you.
 *
 * Record<BadgeVariant, string> means "an object whose keys are exactly the
 * four variant names". If you add 'info' to BadgeVariant above and forget to
 * add it here, TypeScript errors instead of silently rendering unstyled.
 */
const variantClasses: Record<BadgeVariant, string> = {
  neutral: 'bg-gray-100 text-gray-700',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-amber-100 text-amber-800',
  danger: 'bg-red-100 text-red-800',
}

export function Badge({ children, variant = 'neutral' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${variantClasses[variant]}`}
    >
      {children}
    </span>
  )
}
