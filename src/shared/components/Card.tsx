import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  /** Extra Tailwind classes from the parent, appended to the defaults below. */
  className?: string
}

/**
 * A plain white rounded container. Deliberately knows NOTHING about matches,
 * teams, or players — that's what makes it reusable across every feature.
 *
 * Compare with MatchCard (features/matches/components/MatchCard.tsx), which
 * DOES know about matches and is therefore feature-specific. That's the line
 * between shared/ and features/: does this thing understand our domain?
 *
 * `children` is the special prop for "whatever you put between the tags":
 *   <Card>  <p>hello</p>  </Card>   ← that <p> arrives as children
 *
 * rounded-xl = 12px, matching the "12px cards" rule in docs/03-uiux-design-brief.md.
 */
export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`rounded-xl border border-gray-200 bg-white p-4 ${className}`}>
      {children}
    </div>
  )
}
