import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useUiStore } from '@/stores/ui.store'

export function SubmitFeedback() {
  const submitFeedback = useUiStore((state) => state.submitFeedback)

  if (!submitFeedback) {
    return null
  }

  const isSuccess = submitFeedback.type === 'success'

  return (
    <Alert
      variant={isSuccess ? 'success' : 'destructive'}
      aria-live="polite"
      className="animate-in fade-in-0 slide-in-from-top-1 duration-300"
    >
      {isSuccess ? (
        <CheckCircle2 aria-hidden />
      ) : (
        <AlertCircle aria-hidden />
      )}
      <AlertTitle>
        {isSuccess ? 'Cadastro concluído' : 'Não foi possível cadastrar'}
      </AlertTitle>
      <AlertDescription>{submitFeedback.message}</AlertDescription>
    </Alert>
  )
}
