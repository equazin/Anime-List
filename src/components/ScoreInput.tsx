export function ScoreInput({
  value,
  onChange,
}: {
  value: number | null
  onChange: (score: number | null) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(value === n ? null : n)}
          className={`h-7 w-7 rounded text-xs font-semibold transition ${
            value !== null && n <= value
              ? 'bg-yellow-400 text-neutral-900'
              : 'bg-neutral-800 text-neutral-500 hover:bg-neutral-700'
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  )
}
