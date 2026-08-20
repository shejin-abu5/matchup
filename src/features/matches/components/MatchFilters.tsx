import type { MatchFilters as Filters, MatchFormat } from '../types'

interface MatchFiltersProps {
  filters: Filters
  /** Search box value, kept separate because it updates on every keystroke. */
  searchValue: string
  onSearchChange: (value: string) => void
  onFilterChange: (next: Filters) => void
}

const formats: MatchFormat[] = ['5v5', '7v7', '11v11']

const dateOptions = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This week' },
] as const

/**
 * A single filter chip. Pulled out as its own tiny component because we
 * render it seven times below — and because "how does a chip look when
 * active" is now defined in exactly one place.
 */
function Chip({
  label,
  isActive,
  onClick,
}: {
  label: string
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      // aria-pressed tells screen readers this is a toggle and whether it's
      // currently on. Colour alone doesn't communicate state to everyone.
      aria-pressed={isActive}
      className={`rounded-full border px-3 py-1 text-sm transition-colors ${
        isActive
          ? 'border-primary bg-primary text-white'
          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
      }`}
    >
      {label}
    </button>
  )
}

export function MatchFilters({
  filters,
  searchValue,
  onSearchChange,
  onFilterChange,
}: MatchFiltersProps) {
  /**
   * Chips TOGGLE: tapping the active one clears it. Passing `undefined`
   * removes that filter entirely (see DiscoverPage — undefined values get
   * deleted from the URL rather than written as empty strings).
   */
  const toggleFormat = (format: MatchFormat) => {
    onFilterChange({ ...filters, format: filters.format === format ? undefined : format })
  }

  const toggleDate = (date: 'today' | 'week') => {
    onFilterChange({ ...filters, date: filters.date === date ? undefined : date })
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        type="search"
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search by title or location"
        aria-label="Search matches"
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
      />

      {/* overflow-x-auto so the chip row scrolls sideways on a narrow phone
          instead of wrapping into a tall stack that pushes the list down. */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {formats.map((format) => (
          <Chip
            key={format}
            label={format}
            isActive={filters.format === format}
            onClick={() => toggleFormat(format)}
          />
        ))}

        <span className="w-px shrink-0 bg-gray-200" aria-hidden="true" />

        {dateOptions.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            isActive={filters.date === option.value}
            onClick={() => toggleDate(option.value)}
          />
        ))}
      </div>
    </div>
  )
}
