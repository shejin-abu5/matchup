interface SkeletonProps {
  className?: string
}

/**
 * A grey shimmering placeholder shown while data loads.
 *
 * WHY SKELETONS INSTEAD OF A SPINNER (docs/03-uiux-design-brief.md asks for
 * this deliberately): a spinner says "something is happening somewhere". A
 * skeleton says "three match cards are arriving, and they'll look like this".
 * The page doesn't jump around when real data replaces it, because the
 * placeholder already occupies the right space. It measurably *feels* faster
 * even when it isn't.
 *
 * `animate-pulse` is Tailwind's built-in fade in/out animation.
 */
export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`animate-pulse rounded-md bg-gray-200 ${className}`} />
}
