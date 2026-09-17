import type { SearchResult } from './types'

const ENDPOINT = 'https://graphql.anilist.co'

interface AniListMedia {
  id: number
  title: { romaji: string; english: string | null }
  coverImage: { large: string | null }
  startDate: { year: number | null }
  episodes: number | null
  averageScore: number | null
  genres: string[]
  description: string | null
}

function stripHtml(html: string | null): string {
  if (!html) return ''
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function toResult(m: AniListMedia): SearchResult {
  return {
    kind: 'anime',
    externalId: String(m.id),
    title: m.title.english ?? m.title.romaji,
    imageUrl: m.coverImage?.large ?? null,
    year: m.startDate?.year ?? null,
    totalEpisodes: m.episodes ?? null,
    overview: stripHtml(m.description),
    score: m.averageScore !== null ? Math.round(m.averageScore) / 10 : null,
    genres: m.genres ?? [],
  }
}

// AniList's public API is generous (~90 req/min) but still occasionally
// hiccups — the same short retry-with-backoff used for TMDB.
async function anilistFetch(query: string, variables: Record<string, unknown>, retries = 2) {
  let lastError: unknown
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ query, variables }),
      })
      if (res.ok) return res.json()
      if (res.status >= 500 && attempt < retries) {
        await new Promise((r) => setTimeout(r, 600 * (attempt + 1)))
        continue
      }
      throw new Error(`AniList no responde (${res.status})`)
    } catch (err) {
      lastError = err
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 600 * (attempt + 1)))
        continue
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error('AniList no responde')
}

const MEDIA_FIELDS = `
  id
  title { romaji english }
  coverImage { large }
  startDate { year }
  episodes
  averageScore
  genres
  description
`

export async function searchAnime(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return []
  const gql = `
    query ($search: String, $perPage: Int) {
      Page(page: 1, perPage: $perPage) {
        media(search: $search, type: ANIME, sort: SEARCH_MATCH) { ${MEDIA_FIELDS} }
      }
    }
  `
  const json = await anilistFetch(gql, { search: query, perPage: 24 })
  return (json.data.Page.media as AniListMedia[]).map(toResult)
}

export async function topAnime(): Promise<SearchResult[]> {
  const gql = `
    query ($perPage: Int) {
      Page(page: 1, perPage: $perPage) {
        media(type: ANIME, status: RELEASING, sort: POPULARITY_DESC) { ${MEDIA_FIELDS} }
      }
    }
  `
  const json = await anilistFetch(gql, { perPage: 12 })
  return (json.data.Page.media as AniListMedia[]).map(toResult)
}

export async function browseAnime(): Promise<SearchResult[]> {
  const gql = `
    query ($perPage: Int) {
      Page(page: 1, perPage: $perPage) {
        media(type: ANIME, sort: SCORE_DESC) { ${MEDIA_FIELDS} }
      }
    }
  `
  const json = await anilistFetch(gql, { perPage: 24 })
  return (json.data.Page.media as AniListMedia[]).map(toResult)
}
