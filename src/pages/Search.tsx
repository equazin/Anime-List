import { useState } from 'react'
import { searchAnime } from '../lib/jikan'
import { searchMovies, searchTv, hasTmdbKey } from '../lib/tmdb'
import { MediaCard } from '../components/MediaCard'
import type { MediaKind, SearchResult } from '../lib/types'

type Filter = 'all' | MediaKind

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
      <form onSubmit={runSearch} className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar anime, película o serie…"
          className="flex-1 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 focus:border-fuchsia-500 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-md bg-fuchsia-600 px-4 py-2 text-sm font-medium text-white hover:bg-fuchsia-500"
        >
          Buscar
        </button>
      </form>

      {!hasTmdbKey() && (
        <p className="rounded-md bg-amber-500/10 p-3 text-sm text-amber-300">
          Sin <code>VITE_TMDB_API_KEY</code> configurada: solo se buscará en la base de
          MyAnimeList.
        </p>
      )}

      <div className="flex gap-2 text-sm">
        {(['all', 'anime', 'movie', 'tv'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 transition ${
              filter === f
                ? 'bg-fuchsia-500/20 text-fuchsia-300'
                : 'bg-neutral-900 text-neutral-400 hover:text-neutral-100'
            }`}
          >
            {f === 'all' ? 'Todo' : f === 'anime' ? 'Anime' : f === 'movie' ? 'Películas' : 'Series'}
          </button>
        ))}
      </div>

      {loading && <p className="text-sm text-neutral-500">Buscando…</p>}
      {error && !loading && <p className="text-sm text-neutral-500">{error}</p>}

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
        {filtered.map((item) => (
          <MediaCard key={`${item.kind}-${item.externalId}`} item={item} />
        ))}
      </div>
    </div>
  )
}
