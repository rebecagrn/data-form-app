import { useQueryClient } from '@tanstack/react-query'
import { Sparkles } from 'lucide-react'
import { useState } from 'react'
import { ClientList } from '@/components/client-list'
import { ClientRegistrationForm } from '@/components/client-registration-form'
import { clientsListQueryKey } from '@/lib/clients-api'

export function ClientsWorkspace() {
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()

  const handleCreated = () => {
    setPage(1)
    void queryClient.invalidateQueries({ queryKey: clientsListQueryKey })
  }

  return (
    <div className="flex w-full max-w-6xl flex-col items-center gap-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="bg-primary/15 text-primary ring-primary/25 flex size-12 items-center justify-center rounded-2xl shadow-md ring-1">
          <Sparkles className="size-6" aria-hidden />
        </div>
        <div className="space-y-1">
          <p className="text-primary text-xs font-semibold uppercase tracking-widest">
            Data Form App
          </p>
          <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
            Cadastro de clientes
          </h1>
        </div>
      </div>
      <div className="grid w-full items-start gap-8 lg:grid-cols-[minmax(20rem,28rem)_minmax(0,1fr)]">
        <ClientRegistrationForm onCreated={handleCreated} />
        <ClientList page={page} onPageChange={setPage} />
      </div>
    </div>
  )
}
