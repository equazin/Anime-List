import { useState } from 'react'
import { searchAnime } from '../lib/jikan'
import { searchMovies, searchTv, hasTmdbKey } from '../lib/tmdb'
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
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function runSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setError(null)
    try {
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
      if (combined.length === 0) setError('Sin resultados.')
    } catch {
      setError('Ocurrió un error al buscar. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const filtered = filter === 'all' ? results : results.filter((r) => r.kind === filter)

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
          Sin <code>VITE_TMDB_API_KEY</code> configurada: solo se buscará en la base de
          MyAnimeList.
        </p>
      )}

      <div className="flex gap-2">
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
      </div>

      {loading && <p className="text-sm text-neutral-400">Buscando…</p>}
      {error && !loading && <p className="text-sm text-neutral-400">{error}</p>}

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
        {filtered.map((item) => (
          <MediaCard key={`${item.kind}-${item.externalId}`} item={item} />
        ))}
      </div>
    </div>
  )
}
