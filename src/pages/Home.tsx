import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { topAnime } from '../lib/jikan'
import { trendingMovies, hasTmdbKey } from '../lib/tmdb'
import { MediaCard } from '../components/MediaCard'
import { STATUS_COLOR, STATUS_LABEL, STATUS_ORDER, type SearchResult } from '../lib/types'
import { useLibrary } from '../store/library'

export function Home() {
  const [anime, setAnime] = useState<SearchResult[]>([])
  const [movies, setMovies] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [animeError, setAnimeError] = useState(false)
  const [movieError, setMovieError] = useState(false)
  const entries = useLibrary((s) => s.entries)

  function load() {
    setLoading(true)
    setAnimeError(false)
    setMovieError(false)
    Promise.allSettled([topAnime(), trendingMovies()]).then(([a, m]) => {
      if (a.status === 'fulfilled') setAnime(a.value)
      else setAnimeError(true)
      if (m.status === 'fulfilled') setMovies(m.value)
      else setMovieError(true)
      setLoading(false)
    })
  }

  useEffect(() => {
    load()
  }, [])

  const values = Object.values(entries)
  const counts = STATUS_ORDER.map((status) => ({
    status,
    count: values.filter((e) => e.status === status).length,
  }))

  return (
    <div className="flex flex-col gap-10">
      <section>
        <span className="text-[13px] font-bold uppercase tracking-wide text-neutral-400">
          Tu resumen
        </span>
        <div className="mt-3 flex gap-3.5">
          {counts.map(({ status, count }) => (
            <Link
              key={status}
              to="/library"
              className="flex-1 border border-neutral-200 bg-white p-4"
              style={{ borderTopWidth: 4, borderTopColor: STATUS_COLOR[status] }}
            >
              <p className="font-['Archivo_Black'] text-3xl text-neutral-900">{count}</p>
              <p className="text-[13px] font-medium text-neutral-400">{STATUS_LABEL[status]}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <span className="text-[15px] font-bold text-neutral-900">En emisión ahora</span>
          <span className="text-xs text-neutral-400">MyAnimeList · Jikan</span>
        </div>
        {loading ? (
          <p className="text-sm text-neutral-400">Cargando…</p>
        ) : animeError ? (
          <div className="flex items-center justify-between gap-3 rounded-md bg-red-50 p-3 text-sm text-red-700">
            <span>MyAnimeList (Jikan) no está respondiendo ahora mismo.</span>
            <button
              onClick={load}
              className="flex-shrink-0 rounded-md bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {anime.map((item) => (
              <MediaCard key={item.externalId} item={item} />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <span className="text-[15px] font-bold text-neutral-900">Películas populares</span>
          <span className="text-xs text-neutral-400">TMDB</span>
        </div>
        {!hasTmdbKey() ? (
          <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-700">
            Configura <code>VITE_TMDB_API_KEY</code> en un archivo <code>.env</code> para
            ver películas y series (clave gratuita en themoviedb.org).
          </p>
        ) : loading ? null : movieError ? (
          <div className="flex items-center justify-between gap-3 rounded-md bg-red-50 p-3 text-sm text-red-700">
            <span>TMDB no está respondiendo ahora mismo.</span>
            <button
              onClick={load}
              className="flex-shrink-0 rounded-md bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700"
            >
              Reintentar
            </button>
          </div>
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
