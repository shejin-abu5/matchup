interface PagePlaceholderProps {
  title: string
  description: string
}

/**
 * Temporary stand-in so routing works end-to-end before each feature
 * is built. We'll replace each usage of this with a real page as we
 * work through docs/00-architecture-and-learning-roadmap.md's phases.
 */
export function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <div className="p-6">
      <h1 className="text-xl font-medium text-gray-900">{title}</h1>
      <p className="text-gray-500 mt-2">{description}</p>
    </div>
  )
}
