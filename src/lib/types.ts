export type MediaKind = 'anime' | 'movie' | 'tv'

export type WatchStatus =
  | 'watching'
  | 'completed'
  | 'planned'
  | 'on_hold'
  | 'dropped'

export const STATUS_LABEL: Record<WatchStatus, string> = {
  watching: 'Viendo',
  completed: 'Completado',
  planned: 'Pendiente',
  on_hold: 'En pausa',
  dropped: 'Abandonado',
}

export const STATUS_ORDER: WatchStatus[] = [
  'watching',
  'planned',
  'completed',
  'on_hold',
  'dropped',
]

export interface SearchResult {
  kind: MediaKind
  externalId: string
  title: string
  imageUrl: string | null
  year: number | null
  totalEpisodes: number | null
  overview: string
  score: number | null
}

export interface LibraryEntry {
  id: string
  kind: MediaKind
  externalId: string
  title: string
  imageUrl: string | null
  totalEpisodes: number | null
  status: WatchStatus
  score: number | null
  progress: number
  notes: string
  updatedAt: number
}

export function entryId(kind: MediaKind, externalId: string): string {
  return `${kind}:${externalId}`
}
