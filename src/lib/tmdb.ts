import type { MediaKind, SearchResult } from './types'

const BASE = 'https://api.themoviedb.org/3'
const IMG_BASE = 'https://image.tmdb.org/t/p/w342'

function apiKey(): string | null {
  const key = import.meta.env.VITE_TMDB_API_KEY
  return key && key.trim() ? key.trim() : null
}

export function hasTmdbKey(): boolean {
  return apiKey() !== null
}

interface TmdbItem {
  id: number
  title?: string
  name?: string
  poster_path: string | null
  overview: string
  release_date?: string
  first_air_date?: string
  vote_average: number | null
  number_of_episodes?: number
}

function toResult(item: TmdbItem, kind: MediaKind): SearchResult {
  const date = item.release_date ?? item.first_air_date ?? ''
  return {
    kind,
    externalId: String(item.id),
    title: item.title ?? item.name ?? 'Sin título',
    imageUrl: item.poster_path ? `${IMG_BASE}${item.poster_path}` : null,
    year: date ? Number(date.slice(0, 4)) : null,
    totalEpisodes: item.number_of_episodes ?? null,
    overview: item.overview ?? '',
    score: item.vote_average ?? null,
  }
}

async function tmdbFetch(path: string) {
  const key = apiKey()
  if (!key) throw new Error('Falta VITE_TMDB_API_KEY')
  const url = new URL(`${BASE}${path}`)
  url.searchParams.set('api_key', key)
  url.searchParams.set('language', 'es-ES')
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`)
  return res.json()
}

export async function searchMovies(query: string): Promise<SearchResult[]> {
  if (!query.trim() || !hasTmdbKey()) return []
  const json = await tmdbFetch(`/search/movie?query=${encodeURIComponent(query)}`)
  return (json.results as TmdbItem[]).map((r) => toResult(r, 'movie'))
}

export async function searchTv(query: string): Promise<SearchResult[]> {
  if (!query.trim() || !hasTmdbKey()) return []
  const json = await tmdbFetch(`/search/tv?query=${encodeURIComponent(query)}`)
  return (json.results as TmdbItem[]).map((r) => toResult(r, 'tv'))
}

export async function trendingMovies(): Promise<SearchResult[]> {
  if (!hasTmdbKey()) return []
  const json = await tmdbFetch('/trending/movie/week')
  return (json.results as TmdbItem[]).map((r) => toResult(r, 'movie'))
}
