import { useUiStore } from '@/stores/ui.store'

export function SubmitFeedback() {
  const submitFeedback = useUiStore((state) => state.submitFeedback)

  if (!submitFeedback) {
    return null
  }

  const isSuccess = submitFeedback.type === 'success'

  return (
    <div
      role="alert"
      aria-live="polite"
      className={
        isSuccess
          ? 'rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900'
          : 'rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive'
      }
    >
      {submitFeedback.message}
    </div>
  )
}
