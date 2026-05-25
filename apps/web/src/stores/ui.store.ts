import { create } from 'zustand'

type UiState = {
  submitMessage: string | null
  setSubmitMessage: (message: string | null) => void
}

export const useUiStore = create<UiState>((set) => ({
  submitMessage: null,
  setSubmitMessage: (message) => set({ submitMessage: message }),
}))
