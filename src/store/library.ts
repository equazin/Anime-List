import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { entryId, type LibraryEntry, type SearchResult, type WatchStatus } from '../lib/types'

interface LibraryState {
  entries: Record<string, LibraryEntry>
  upsert: (result: SearchResult, status: WatchStatus) => void
  remove: (id: string) => void
  setStatus: (id: string, status: WatchStatus) => void
  setScore: (id: string, score: number | null) => void
  setProgress: (id: string, progress: number) => void
  setNotes: (id: string, notes: string) => void
  get: (kind: SearchResult['kind'], externalId: string) => LibraryEntry | undefined
}

export const useLibrary = create<LibraryState>()(
  persist(
    (set, get) => ({
      entries: {},
      upsert: (result, status) => {
        const id = entryId(result.kind, result.externalId)
        set((state) => ({
          entries: {
            ...state.entries,
            [id]: {
              id,
              kind: result.kind,
              externalId: result.externalId,
              title: result.title,
              imageUrl: result.imageUrl,
              totalEpisodes: result.totalEpisodes,
              status,
              score: state.entries[id]?.score ?? null,
              progress: state.entries[id]?.progress ?? 0,
              notes: state.entries[id]?.notes ?? '',
              updatedAt: Date.now(),
            },
          },
        }))
      },
      remove: (id) =>
        set((state) => {
          const rest = { ...state.entries }
          delete rest[id]
          return { entries: rest }
        }),
      setStatus: (id, status) =>
        set((state) => {
          const entry = state.entries[id]
          if (!entry) return state
          return {
            entries: { ...state.entries, [id]: { ...entry, status, updatedAt: Date.now() } },
          }
        }),
      setScore: (id, score) =>
        set((state) => {
          const entry = state.entries[id]
          if (!entry) return state
          return {
            entries: { ...state.entries, [id]: { ...entry, score, updatedAt: Date.now() } },
          }
        }),
      setProgress: (id, progress) =>
        set((state) => {
          const entry = state.entries[id]
          if (!entry) return state
          return {
            entries: { ...state.entries, [id]: { ...entry, progress, updatedAt: Date.now() } },
          }
        }),
      setNotes: (id, notes) =>
        set((state) => {
          const entry = state.entries[id]
          if (!entry) return state
          return { entries: { ...state.entries, [id]: { ...entry, notes } } }
        }),
      get: (kind, externalId) => get().entries[entryId(kind, externalId)],
    }),
    { name: 'anime-tracker-library' }
  )
)
