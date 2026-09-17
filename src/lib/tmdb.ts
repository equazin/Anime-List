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

// TMDB genre ids are fixed per kind — no extra request needed to label them.
const MOVIE_GENRES: Record<number, string> = {
  28: 'Acción', 12: 'Aventura', 16: 'Animación', 35: 'Comedia', 80: 'Crimen',
  99: 'Documental', 18: 'Drama', 10751: 'Familiar', 14: 'Fantasía', 36: 'Historia',
  27: 'Terror', 10402: 'Música', 9648: 'Misterio', 10749: 'Romance', 878: 'Ciencia ficción',
  10770: 'Película de TV', 53: 'Suspenso', 10752: 'Bélica', 37: 'Western',
}
const TV_GENRES: Record<number, string> = {
  10759: 'Acción y aventura', 16: 'Animación', 35: 'Comedia', 80: 'Crimen',
  99: 'Documental', 18: 'Drama', 10751: 'Familiar', 10762: 'Infantil', 9648: 'Misterio',
  10763: 'Noticias', 10764: 'Reality', 10765: 'Ciencia ficción y fantasía', 10766: 'Telenovela',
  10767: 'Talk show', 10768: 'Bélica y política', 37: 'Western',
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
  genre_ids?: number[]
}

function toResult(item: TmdbItem, kind: MediaKind): SearchResult {
  const date = item.release_date ?? item.first_air_date ?? ''
  const genreMap = kind === 'movie' ? MOVIE_GENRES : TV_GENRES
  return {
    kind,
    externalId: String(item.id),
    title: item.title ?? item.name ?? 'Sin título',
    imageUrl: item.poster_path ? `${IMG_BASE}${item.poster_path}` : null,
    year: date ? Number(date.slice(0, 4)) : null,
    totalEpisodes: item.number_of_episodes ?? null,
    overview: item.overview ?? '',
    score: item.vote_average ?? null,
    genres: (item.genre_ids ?? []).map((id) => genreMap[id]).filter((g): g is string => Boolean(g)),
  }
}

async function tmdbFetch(path: string, retries = 2) {
  const key = apiKey()
  if (!key) throw new Error('Falta VITE_TMDB_API_KEY')
  const url = new URL(`${BASE}${path}`)
  url.searchParams.set('api_key', key)
  url.searchParams.set('language', 'es-ES')

  let lastError: unknown
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url.toString())
      if (res.ok) return res.json()
      if (res.status >= 500 && attempt < retries) {
        await new Promise((r) => setTimeout(r, 600 * (attempt + 1)))
        continue
      }
      throw new Error(`TMDB no responde (${res.status})`)
    } catch (err) {
      lastError = err
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 600 * (attempt + 1)))
        continue
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error('TMDB no responde')
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

export async function browseMovies(): Promise<SearchResult[]> {
  if (!hasTmdbKey()) return []
  const json = await tmdbFetch('/movie/popular')
  return (json.results as TmdbItem[]).map((r) => toResult(r, 'movie'))
}

export async function browseTv(): Promise<SearchResult[]> {
  if (!hasTmdbKey()) return []
  const json = await tmdbFetch('/tv/popular')
  return (json.results as TmdbItem[]).map((r) => toResult(r, 'tv'))
}
