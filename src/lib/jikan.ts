import type { SearchResult } from './types'

const BASE = 'https://api.jikan.moe/v4'

interface JikanAnime {
  mal_id: number
  title: string
  images: { jpg: { image_url: string; large_image_url: string } }
  episodes: number | null
  score: number | null
  synopsis: string | null
  year: number | null
  aired: { prop: { from: { year: number | null } } }
}

function toResult(a: JikanAnime): SearchResult {
  return {
    kind: 'anime',
    externalId: String(a.mal_id),
    title: a.title,
    imageUrl: a.images?.jpg?.large_image_url ?? a.images?.jpg?.image_url ?? null,
    year: a.year ?? a.aired?.prop?.from?.year ?? null,
    totalEpisodes: a.episodes ?? null,
    overview: a.synopsis ?? '',
    score: a.score ?? null,
  }
}

// Jikan rate-limits to ~3 req/s; a tiny in-memory throttle avoids 429s.
let lastCall = 0
async function throttledFetch(url: string): Promise<Response> {
  const wait = Math.max(0, lastCall + 400 - Date.now())
  if (wait > 0) await new Promise((r) => setTimeout(r, wait))
  lastCall = Date.now()
  return fetch(url)
}

export async function searchAnime(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return []
  const res = await throttledFetch(
    `${BASE}/anime?q=${encodeURIComponent(query)}&limit=15&sfw=true`
  )
  if (!res.ok) throw new Error(`Jikan error: ${res.status}`)
  const json = await res.json()
  return (json.data as JikanAnime[]).map(toResult)
}

export async function topAnime(): Promise<SearchResult[]> {
  const res = await throttledFetch(`${BASE}/top/anime?filter=airing&limit=12`)
  if (!res.ok) throw new Error(`Jikan error: ${res.status}`)
  const json = await res.json()
  return (json.data as JikanAnime[]).map(toResult)
}

export async function getAnimeById(id: string): Promise<SearchResult> {
  const res = await throttledFetch(`${BASE}/anime/${id}`)
  if (!res.ok) throw new Error(`Jikan error: ${res.status}`)
  const json = await res.json()
  return toResult(json.data as JikanAnime)
}
