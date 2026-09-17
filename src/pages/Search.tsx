import { useEffect, useMemo, useState } from 'react'
import { browseAnime, searchAnime } from '../lib/jikan'
import { browseMovies, browseTv, searchMovies, searchTv, hasTmdbKey } from '../lib/tmdb'
import { MediaCard } from '../components/MediaCard'
import type { MediaKind, SearchResult } from '../lib/types'

type Filter = 'all' | MediaKind

const FILTER_LABEL: Record<Filter, string> = {
  all: 'Todo',
  anime: 'Anime',
  movie: 'Películas',
  tv: 'Series',
}

export function Search() {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [genre, setGenre] = useState<string | null>(null)
  const [results, setResults] = useState<SearchResult[]>([])
  const [mode, setMode] = useState<'browse' | 'search'>('browse')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadBrowse()
  }, [])

  function describeFailure(animeFailed: boolean, otherFailed: boolean): string | null {
    if (animeFailed && otherFailed) return 'MyAnimeList y TMDB no están respondiendo ahora mismo.'
    if (animeFailed) return 'MyAnimeList (Jikan) no está respondiendo ahora mismo — puede ser una caída temporal del servicio.'
    if (otherFailed) return 'TMDB no está respondiendo ahora mismo.'
    return null
  }

  async function loadBrowse() {
    setMode('browse')
    setLoading(true)
    setError(null)
    const [animeRes, movieRes, tvRes] = await Promise.allSettled([
      browseAnime(),
      browseMovies(),
      browseTv(),
    ])
    const combined: SearchResult[] = []
    if (animeRes.status === 'fulfilled') combined.push(...animeRes.value)
    if (movieRes.status === 'fulfilled') combined.push(...movieRes.value)
    if (tvRes.status === 'fulfilled') combined.push(...tvRes.value)
    setResults(combined)
    setGenre(null)
    setError(describeFailure(animeRes.status === 'rejected', movieRes.status === 'rejected' || tvRes.status === 'rejected'))
    setLoading(false)
  }

  function runSearch(e: React.FormEvent) {
    e.preventDefault()
    performSearch()
  }

  async function performSearch() {
    if (!query.trim()) {
      loadBrowse()
      return
    }
    setMode('search')
    setLoading(true)
    setError(null)
    const [animeRes, movieRes, tvRes] = await Promise.allSettled([
      searchAnime(query),
      searchMovies(query),
      searchTv(query),
    ])
    const combined: SearchResult[] = []
    if (animeRes.status === 'fulfilled') combined.push(...animeRes.value)
    if (movieRes.status === 'fulfilled') combined.push(...movieRes.value)
    if (tvRes.status === 'fulfilled') combined.push(...tvRes.value)
    setResults(combined)
    setGenre(null)
    const failureMessage = describeFailure(
      animeRes.status === 'rejected',
      movieRes.status === 'rejected' || tvRes.status === 'rejected'
    )
    if (failureMessage) setError(failureMessage)
    else if (combined.length === 0) setError('Sin resultados.')
    setLoading(false)
  }

  const byKind = filter === 'all' ? results : results.filter((r) => r.kind === filter)

  const genres = useMemo(() => {
    const set = new Set<string>()
    byKind.forEach((r) => r.genres.forEach((g) => set.add(g)))
    return Array.from(set).sort().slice(0, 14)
  }, [byKind])

  const filtered = genre ? byKind.filter((r) => r.genres.includes(genre)) : byKind

  return (
    <div className="flex flex-col gap-5">
      <form onSubmit={runSearch} className="flex gap-2.5">
        <div className="flex flex-1 items-center gap-2.5 border border-neutral-200 bg-white px-4">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A8A85" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar anime, película o serie…"
            className="h-[52px] flex-1 bg-transparent text-[15px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="h-[52px] bg-neutral-900 px-7 text-sm font-bold text-white hover:bg-neutral-800"
        >
          Buscar
        </button>
      </form>

      {!hasTmdbKey() && (
        <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-700">
          Sin <code>VITE_TMDB_API_KEY</code> configurada: solo se muestran datos de
          MyAnimeList.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {(['all', 'anime', 'movie', 'tv'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition ${
              filter === f
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-100 text-neutral-500 hover:text-neutral-800'
            }`}
          >
            {FILTER_LABEL[f]}
          </button>
        ))}
        {mode === 'browse' && !loading && !error && (
          <span className="ml-1 text-xs text-neutral-400">Explorando lo más popular</span>
        )}
      </div>

      {genres.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setGenre(null)}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              genre === null
                ? 'border-[#2F6FED] text-[#2F6FED]'
                : 'border-neutral-200 text-neutral-500 hover:border-neutral-400'
            }`}
          >
            Todas las categorías
          </button>
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => setGenre(g)}
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                genre === g
                  ? 'border-[#2F6FED] text-[#2F6FED]'
                  : 'border-neutral-200 text-neutral-500 hover:border-neutral-400'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      )}

      {loading && <p className="text-sm text-neutral-400">Cargando…</p>}

      {error && !loading && (
        <div className="flex items-center justify-between gap-3 rounded-md bg-red-50 p-3 text-sm text-red-700">
          <span>{error}</span>
          <button
            onClick={mode === 'search' ? performSearch : loadBrowse}
            className="flex-shrink-0 rounded-md bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
        {filtered.map((item) => (
          <MediaCard key={`${item.kind}-${item.externalId}`} item={item} />
        ))}
      </div>
    </div>
  )
}
