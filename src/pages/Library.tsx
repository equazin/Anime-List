import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLibrary } from '../store/library'
import { STATUS_LABEL, STATUS_ORDER, type MediaKind, type WatchStatus } from '../lib/types'

const KIND_LABEL: Record<MediaKind, string> = {
  anime: 'Anime',
  movie: 'Película',
  tv: 'Serie',
}

export function Library() {
  const entries = useLibrary((s) => s.entries)
  const remove = useLibrary((s) => s.remove)
  const [statusFilter, setStatusFilter] = useState<WatchStatus | 'all'>('all')

  const list = useMemo(() => {
    const values = Object.values(entries)
    const filtered =
      statusFilter === 'all' ? values : values.filter((e) => e.status === statusFilter)
    return filtered.sort((a, b) => b.updatedAt - a.updatedAt)
  }, [entries, statusFilter])

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-neutral-50">Mi lista</h1>

      <div className="flex flex-wrap gap-2 text-sm">
        <button
          onClick={() => setStatusFilter('all')}
          className={`rounded-full px-3 py-1 ${
            statusFilter === 'all'
              ? 'bg-fuchsia-500/20 text-fuchsia-300'
              : 'bg-neutral-900 text-neutral-400 hover:text-neutral-100'
          }`}
        >
          Todo ({Object.keys(entries).length})
        </button>
        {STATUS_ORDER.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`rounded-full px-3 py-1 ${
              statusFilter === status
                ? 'bg-fuchsia-500/20 text-fuchsia-300'
                : 'bg-neutral-900 text-neutral-400 hover:text-neutral-100'
            }`}
          >
            {STATUS_LABEL[status]} ({Object.values(entries).filter((e) => e.status === status).length})
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="rounded-md bg-neutral-900 p-6 text-center text-sm text-neutral-500">
          No hay títulos aquí. Ve a <Link to="/search" className="text-fuchsia-400">Buscar</Link>{' '}
          para agregar animes, películas o series.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg ring-1 ring-neutral-800">
          <table className="w-full text-sm">
            <thead className="bg-neutral-900 text-left text-neutral-400">
              <tr>
                <th className="px-3 py-2">Título</th>
                <th className="px-3 py-2">Tipo</th>
                <th className="px-3 py-2">Estado</th>
                <th className="px-3 py-2">Progreso</th>
                <th className="px-3 py-2">Puntaje</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {list.map((entry) => (
                <tr key={entry.id} className="border-t border-neutral-800 hover:bg-neutral-900/50">
                  <td className="px-3 py-2">
                    <Link
                      to={`/title/${entry.kind}/${entry.externalId}`}
                      className="flex items-center gap-2 text-neutral-100"
                    >
                      {entry.imageUrl && (
                        <img src={entry.imageUrl} alt="" className="h-10 w-7 rounded object-cover" />
                      )}
                      {entry.title}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-neutral-400">{KIND_LABEL[entry.kind]}</td>
                  <td className="px-3 py-2 text-neutral-400">{STATUS_LABEL[entry.status]}</td>
                  <td className="px-3 py-2 text-neutral-400">
                    {entry.progress}
                    {entry.totalEpisodes ? ` / ${entry.totalEpisodes}` : ''}
                  </td>
                  <td className="px-3 py-2 text-yellow-300">
                    {entry.score !== null ? `★ ${entry.score}` : '—'}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => remove(entry.id)}
                      className="text-xs text-neutral-500 hover:text-red-400"
                    >
                      Quitar
                    </button>
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
