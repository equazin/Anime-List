import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLibrary } from '../store/library'
import { useAddModal } from '../store/modal'
import { STATUS_COLOR, STATUS_LABEL, STATUS_ORDER, type MediaKind, type WatchStatus } from '../lib/types'

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
        <div className="overflow-x-auto border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-200 text-left text-neutral-400">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Título</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Tipo</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Estado</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Progreso</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Puntaje</th>
              </tr>
            </thead>
            <tbody>
              {list.map((entry) => (
                <tr
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
                    })
                  }
                  className="cursor-pointer border-t border-neutral-100 hover:bg-neutral-50"
                >
                  <td className="flex items-center gap-2.5 px-4 py-2.5 font-semibold text-neutral-900">
                    {entry.imageUrl && (
                      <img src={entry.imageUrl} alt="" className="h-10 w-7 rounded object-cover" />
                    )}
                    {entry.title}
                  </td>
                  <td className="px-4 py-2.5 text-neutral-400">{KIND_LABEL[entry.kind]}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className="rounded-full px-2.5 py-1 text-xs font-semibold"
                      style={{ background: `${STATUS_COLOR[entry.status]}1A`, color: STATUS_COLOR[entry.status] }}
                    >
                      {STATUS_LABEL[entry.status]}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-neutral-400">
                    {entry.progress}
                    {entry.totalEpisodes ? ` / ${entry.totalEpisodes}` : ''}
                  </td>
                  <td className="px-4 py-2.5">
                    {entry.score !== null ? (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-900 text-xs font-bold text-white">
                        {entry.score}
                      </span>
                    ) : (
                      <span className="text-neutral-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
