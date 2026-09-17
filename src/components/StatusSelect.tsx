import { STATUS_LABEL, STATUS_ORDER, type WatchStatus } from '../lib/types'

export function StatusSelect({
  value,
  onChange,
}: {
  value: WatchStatus | null
  onChange: (status: WatchStatus) => void
}) {
  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value as WatchStatus)}
      className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 focus:border-fuchsia-500 focus:outline-none"
    >
      <option value="" disabled>
        Agregar a mi lista…
      </option>
      {STATUS_ORDER.map((status) => (
        <option key={status} value={status}>
          {STATUS_LABEL[status]}
        </option>
      ))}
    </select>
  )
}
