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

export interface PagedResult {
  items: SearchResult[]
  hasNextPage: boolean
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

function toPaged(json: { data: { Page: { pageInfo: { hasNextPage: boolean }; media: AniListMedia[] } } }): PagedResult {
  return {
    items: json.data.Page.media.map(toResult),
    hasNextPage: json.data.Page.pageInfo.hasNextPage,
  }
}

export async function searchAnime(query: string, page = 1): Promise<PagedResult> {
  if (!query.trim()) return { items: [], hasNextPage: false }
  const gql = `
    query ($search: String, $page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { hasNextPage }
        media(search: $search, type: ANIME, sort: SEARCH_MATCH) { ${MEDIA_FIELDS} }
      }
    }
  `
  const json = await anilistFetch(gql, { search: query, page, perPage: 24 })
  return toPaged(json)
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

export async function browseAnime(page = 1): Promise<PagedResult> {
  const gql = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { hasNextPage }
        media(type: ANIME, sort: SCORE_DESC) { ${MEDIA_FIELDS} }
      }
    }
  `
  const json = await anilistFetch(gql, { page, perPage: 24 })
  return toPaged(json)
}
