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
  genres: { name: string }[]
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
    genres: (a.genres ?? []).map((g) => g.name),
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

// Jikan proxies MyAnimeList itself and occasionally 502/503/504s on a cold
// cache; a couple of short retries clear most of those without the caller
// having to know about it.
async function resilientFetch(url: string, retries = 2): Promise<Response> {
  let lastError: unknown
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await throttledFetch(url)
      if (res.ok) return res
      if (res.status >= 500 && attempt < retries) {
        await new Promise((r) => setTimeout(r, 600 * (attempt + 1)))
        continue
      }
      throw new Error(`Jikan no responde (${res.status})`)
    } catch (err) {
      lastError = err
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 600 * (attempt + 1)))
        continue
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Jikan no responde')
}

export async function searchAnime(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return []
  const res = await resilientFetch(`${BASE}/anime?q=${encodeURIComponent(query)}&limit=15&sfw=true`)
  const json = await res.json()
  return (json.data as JikanAnime[]).map(toResult)
}

export async function topAnime(): Promise<SearchResult[]> {
  const res = await resilientFetch(`${BASE}/top/anime?filter=airing&limit=12`)
  const json = await res.json()
  return (json.data as JikanAnime[]).map(toResult)
}

export async function browseAnime(): Promise<SearchResult[]> {
  const res = await resilientFetch(`${BASE}/top/anime?limit=24`)
  const json = await res.json()
  return (json.data as JikanAnime[]).map(toResult)
}
