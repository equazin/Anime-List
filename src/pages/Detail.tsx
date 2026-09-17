import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getAnimeById } from '../lib/jikan'
import { getMovieOrTvById } from '../lib/tmdb'
import { useLibrary } from '../store/library'
import { StatusSelect } from '../components/StatusSelect'
import { ScoreInput } from '../components/ScoreInput'
import type { MediaKind, SearchResult } from '../lib/types'

export function Detail() {
  const { kind, id } = useParams<{ kind: MediaKind; id: string }>()
  const [item, setItem] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const entry = useLibrary((s) => (kind && id ? s.get(kind, id) : undefined))
  const upsert = useLibrary((s) => s.upsert)
  const setStatus = useLibrary((s) => s.setStatus)
  const setScore = useLibrary((s) => s.setScore)
  const setProgress = useLibrary((s) => s.setProgress)
  const setNotes = useLibrary((s) => s.setNotes)

  useEffect(() => {
    if (!kind || !id) return
    setLoading(true)
    setError(null)
    const fetcher = kind === 'anime' ? getAnimeById(id) : getMovieOrTvById(kind, id)
    fetcher
      .then(setItem)
      .catch(() => setError('No se pudo cargar la información.'))
      .finally(() => setLoading(false))
  }, [kind, id])

  if (loading) return <p className="text-sm text-neutral-500">Cargando…</p>
  if (error || !item) return <p className="text-sm text-neutral-500">{error ?? 'No encontrado.'}</p>

  return (
    <div className="flex flex-col gap-6 sm:flex-row">
      <div className="w-full max-w-[240px] shrink-0">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.title} className="w-full rounded-lg object-cover" />
        ) : (
          <div className="flex aspect-[2/3] items-center justify-center rounded-lg bg-neutral-900 text-sm text-neutral-500">
            Sin imagen
          </div>
        )}
      </div>

      <div className="flex-1">
        <Link to="/search" className="text-xs text-neutral-500 hover:text-fuchsia-400">
          ← Volver a buscar
        </Link>
        <h1 className="mt-1 text-2xl font-semibold text-neutral-50">{item.title}</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {item.year ?? 'Año desconocido'}
          {item.totalEpisodes ? ` · ${item.totalEpisodes} episodios` : ''}
          {item.score !== null ? ` · ★ ${item.score.toFixed(1)} (comunidad)` : ''}
        </p>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-300">
          {item.overview || 'Sin sinopsis disponible.'}
        </p>

        <div className="mt-6 flex flex-col gap-4 rounded-lg bg-neutral-900 p-4 ring-1 ring-neutral-800">
          {!entry ? (
            <StatusSelect value={null} onChange={(status) => upsert(item, status)} />
          ) : (
            <>
              <div>
                <p className="mb-1 text-xs text-neutral-500">Estado</p>
                <StatusSelect value={entry.status} onChange={(status) => setStatus(entry.id, status)} />
              </div>

              <div>
                <p className="mb-1 text-xs text-neutral-500">Puntaje</p>
                <ScoreInput value={entry.score} onChange={(score) => setScore(entry.id, score)} />
              </div>

              <div>
                <p className="mb-1 text-xs text-neutral-500">
                  Progreso {item.totalEpisodes ? `(de ${item.totalEpisodes})` : ''}
                </p>
                <input
                  type="number"
                  min={0}
                  max={item.totalEpisodes ?? undefined}
                  value={entry.progress}
                  onChange={(e) => setProgress(entry.id, Number(e.target.value))}
                  className="w-24 rounded-md border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-sm text-neutral-100"
                />
              </div>

              <div>
                <p className="mb-1 text-xs text-neutral-500">Notas</p>
                <textarea
                  value={entry.notes}
                  onChange={(e) => setNotes(entry.id, e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-sm text-neutral-100"
                  placeholder="Notas personales…"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
