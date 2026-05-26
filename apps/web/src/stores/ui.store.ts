import { create } from 'zustand'

export type SubmitFeedback = {
  type: 'success' | 'error'
  message: string
}

type UiState = {
  submitFeedback: SubmitFeedback | null
  setSubmitFeedback: (feedback: SubmitFeedback | null) => void
}

export const useUiStore = create<UiState>((set) => ({
  submitFeedback: null,
  setSubmitFeedback: (feedback) => set({ submitFeedback: feedback }),
}))
