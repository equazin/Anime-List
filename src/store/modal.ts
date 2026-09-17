import { create } from 'zustand'
import type { SearchResult } from '../lib/types'

interface ModalState {
  target: SearchResult | null
  open: (target: SearchResult) => void
  close: () => void
}

export const useAddModal = create<ModalState>((set) => ({
  target: null,
  open: (target) => set({ target }),
  close: () => set({ target: null }),
}))
