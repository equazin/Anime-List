import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { topAnime } from '../lib/jikan'
import { trendingMovies, hasTmdbKey } from '../lib/tmdb'
import { MediaCard } from '../components/MediaCard'
import { STATUS_LABEL, STATUS_ORDER, type SearchResult } from '../lib/types'
import { useLibrary } from '../store/library'

export function Home() {
  const [anime, setAnime] = useState<SearchResult[]>([])
  const [movies, setMovies] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(true)
  const entries = useLibrary((s) => s.entries)

  useEffect(() => {
    Promise.allSettled([topAnime(), trendingMovies()]).then(([a, m]) => {
      if (a.status === 'fulfilled') setAnime(a.value)
      if (m.status === 'fulfilled') setMovies(m.value)
      setLoading(false)
    })
  }, [])

  const values = Object.values(entries)
  const counts = STATUS_ORDER.map((status) => ({
    status,
    count: values.filter((e) => e.status === status).length,
  }))

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h1 className="mb-1 text-2xl font-semibold text-neutral-50">
          Tu resumen
        </h1>
        <p className="mb-4 text-sm text-neutral-500">
          {values.length} títulos en tu lista
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {counts.map(({ status, count }) => (
            <Link
              key={status}
              to="/library"
              className="rounded-lg bg-neutral-900 p-4 text-center ring-1 ring-neutral-800 transition hover:ring-fuchsia-500/60"
            >
              <p className="text-2xl font-bold text-neutral-100">{count}</p>
              <p className="text-xs text-neutral-500">{STATUS_LABEL[status]}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-neutral-100">
          Anime en emisión (MyAnimeList)
        </h2>
        {loading ? (
          <p className="text-sm text-neutral-500">Cargando…</p>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {anime.map((item) => (
              <MediaCard key={item.externalId} item={item} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-neutral-100">
          Películas populares (TMDB)
        </h2>
        {!hasTmdbKey() ? (
          <p className="rounded-md bg-amber-500/10 p-3 text-sm text-amber-300">
            Configura <code>VITE_TMDB_API_KEY</code> en un archivo <code>.env</code> para
            ver películas y series (clave gratuita en themoviedb.org).
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {movies.map((item) => (
              <MediaCard key={item.externalId} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
