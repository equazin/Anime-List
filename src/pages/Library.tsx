import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLibrary } from '../store/library'
import { useAddModal } from '../store/modal'
import {
  STATUS_COLOR,
  STATUS_LABEL,
  STATUS_ORDER,
  scoreColor,
  type MediaKind,
  type WatchStatus,
} from '../lib/types'

const KIND_LABEL: Record<MediaKind, string> = {
  anime: 'Anime',
  movie: 'Película',
  tv: 'Serie',
}

export function Library() {
  const entries = useLibrary((s) => s.entries)
  const openModal = useAddModal((s) => s.open)
  const [statusFilter, setStatusFilter] = useState<WatchStatus | 'all'>('all')

  const list = useMemo(() => {
    const values = Object.values(entries)
    const filtered =
      statusFilter === 'all' ? values : values.filter((e) => e.status === statusFilter)
    return filtered.sort((a, b) => b.updatedAt - a.updatedAt)
  }, [entries, statusFilter])

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-['Archivo_Black'] text-2xl text-neutral-900">Mi lista</h1>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter('all')}
          className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold ${
            statusFilter === 'all'
              ? 'bg-neutral-900 text-white'
              : 'bg-neutral-100 text-neutral-500 hover:text-neutral-800'
          }`}
        >
          Todo ({Object.keys(entries).length})
        </button>
        {STATUS_ORDER.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            style={statusFilter === status ? { background: STATUS_COLOR[status], color: '#fff' } : undefined}
            className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold ${
              statusFilter === status ? '' : 'bg-neutral-100 text-neutral-500 hover:text-neutral-800'
            }`}
          >
            {STATUS_LABEL[status]} ({Object.values(entries).filter((e) => e.status === status).length})
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="rounded-md bg-white p-6 text-center text-sm text-neutral-400 ring-1 ring-neutral-200">
          No hay títulos aquí. Ve a{' '}
          <Link to="/search" className="font-semibold text-[#2F6FED]">
            Buscar
          </Link>{' '}
          para agregar animes, películas o series.
        </p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {list.map((entry) => {
            const pct = entry.totalEpisodes ? Math.min(100, (entry.progress / entry.totalEpisodes) * 100) : 0
            return (
              <div
                key={entry.id}
                onClick={() =>
                  openModal({
                    kind: entry.kind,
                    externalId: entry.externalId,
                    title: entry.title,
                    imageUrl: entry.imageUrl,
                    totalEpisodes: entry.totalEpisodes,
                    year: null,
                    overview: '',
                    score: null,
                    genres: [],
                  })
                }
                className="flex cursor-pointer items-center gap-4 border border-neutral-200 bg-white p-3.5 transition hover:border-neutral-300 hover:shadow-sm"
              >
                <div className="h-[68px] w-[48px] flex-shrink-0 overflow-hidden rounded bg-neutral-100">
                  {entry.imageUrl ? (
                    <img src={entry.imageUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-lg font-black text-neutral-300">
                      {entry.title[0]}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-grow">
                  <p className="truncate text-[15px] font-semibold text-neutral-900">{entry.title}</p>
                  <p className="text-xs text-neutral-400">{KIND_LABEL[entry.kind]}</p>
                </div>

                <span
                  className="hidden flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold sm:inline-block"
                  style={{ background: `${STATUS_COLOR[entry.status]}1A`, color: STATUS_COLOR[entry.status] }}
                >
                  {STATUS_LABEL[entry.status]}
                </span>

                <div className="hidden w-40 flex-shrink-0 flex-col gap-1 md:flex">
                  <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className="h-full rounded-full bg-neutral-900"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-neutral-400">
                    {entry.progress}
                    {entry.totalEpisodes ? ` / ${entry.totalEpisodes} episodios` : ' episodios'}
                  </span>
                </div>

                <div className="flex flex-shrink-0 flex-col items-center gap-0.5">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full text-base font-bold text-white"
                    style={{ background: scoreColor(entry.score) }}
                  >
                    {entry.score ?? '—'}
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-wide text-neutral-400">
                    puntaje
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
