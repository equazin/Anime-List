import { useAddModal } from '../store/modal'
import { useLibrary } from '../store/library'
import { entryId, STATUS_COLOR, STATUS_ORDER, STATUS_LABEL, type WatchStatus } from '../lib/types'

export function AddToListModal() {
  const target = useAddModal((s) => s.target)
  const close = useAddModal((s) => s.close)
  const entry = useLibrary((s) => (target ? s.get(target.kind, target.externalId) : undefined))

  if (!target) return null

  function ensureId(): string {
    const existing = useLibrary.getState().get(target!.kind, target!.externalId)
    if (existing) return existing.id
    useLibrary.getState().upsert(target!, 'planned')
    return entryId(target!.kind, target!.externalId)
  }

  function pickStatus(status: WatchStatus) {
    useLibrary.getState().setStatus(ensureId(), status)
  }

  function pickScore(score: number) {
    const id = ensureId()
    const current = useLibrary.getState().entries[id]?.score
    useLibrary.getState().setScore(id, current === score ? null : score)
  }

  function step(delta: number) {
    const id = ensureId()
    const current = useLibrary.getState().entries[id]?.progress ?? 0
    const max = target!.totalEpisodes ?? Infinity
    useLibrary.getState().setProgress(id, Math.max(0, Math.min(max, current + delta)))
  }

  function remove() {
    if (entry) useLibrary.getState().remove(entry.id)
    close()
  }

  return (
    <div
      onClick={close}
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/60 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-[440px] flex-col gap-5 rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start gap-3.5">
          <div className="h-[78px] w-14 flex-shrink-0 overflow-hidden rounded bg-neutral-200">
            {target.imageUrl ? (
              <img src={target.imageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-2xl font-black text-neutral-400">
                {target.title[0]}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-grow">
            <p className="text-base font-bold leading-snug text-neutral-900">{target.title}</p>
            <p className="mt-0.5 text-xs text-neutral-400">
              {target.kind === 'anime' ? 'Anime' : target.kind === 'movie' ? 'Película' : 'Serie'}
              {target.score !== null ? ` · ${target.score.toFixed(1)} comunidad` : ''}
            </p>
          </div>
          <button
            onClick={close}
            aria-label="Cerrar"
            className="flex-shrink-0 text-xl leading-none text-neutral-400 hover:text-neutral-700"
          >
            ×
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
            Agregar a mi lista
          </span>
          <div className="flex flex-wrap gap-2">
            {STATUS_ORDER.map((status) => {
              const active = entry?.status === status
              const color = STATUS_COLOR[status]
              return (
                <button
                  key={status}
                  onClick={() => pickStatus(status)}
                  style={{
                    borderColor: active ? color : '#E4E4E7',
                    background: active ? color : 'none',
                    color: active ? '#fff' : '#71717A',
                  }}
                  className="rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-colors"
                >
                  {STATUS_LABEL[status]}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
            Puntaje{entry?.score ? ` — ${entry.score} / 10` : ''}
          </span>
          <div className="grid grid-cols-10 gap-1.5">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
              const active = entry?.score === n
              return (
                <button
                  key={n}
                  onClick={() => pickScore(n)}
                  className={`flex h-[34px] items-center justify-center rounded-lg border text-xs font-bold transition-colors ${
                    active
                      ? 'border-neutral-900 bg-neutral-900 text-white'
                      : 'border-transparent bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
                  }`}
                >
                  {n}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
            Progreso
          </span>
          <div className="flex items-center gap-3.5">
            <button onClick={() => step(-1)} className="text-lg text-neutral-400 hover:text-neutral-900">
              −
            </button>
            <span className="text-[15px] font-semibold text-neutral-900">
              {entry?.progress ?? 0}
              <span className="font-normal text-neutral-400">
                {target.totalEpisodes ? ` / ${target.totalEpisodes}` : ''}
              </span>
            </span>
            <button onClick={() => step(1)} className="text-lg text-neutral-400 hover:text-neutral-900">
              +
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          {entry && (
            <button
              onClick={remove}
              className="flex-shrink-0 rounded-lg border border-neutral-200 px-4 text-[13px] font-semibold text-neutral-500 hover:border-red-300 hover:text-red-500"
            >
              Quitar
            </button>
          )}
          <button
            onClick={close}
            className="flex-grow rounded-lg bg-neutral-900 py-3 text-[13px] font-bold text-white hover:bg-neutral-800"
          >
            Guardar en mi lista
          </button>
        </div>
      </div>
    </div>
  )
}
