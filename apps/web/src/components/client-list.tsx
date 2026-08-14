import {
  RAINBOW_COLOR_LABELS,
  RAINBOW_COLOR_SWATCHES,
  RAINBOW_COLORS,
  type RainbowColor,
} from '@data-form/shared'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { CLIENTS_PAGE_SIZE, clientsListQueryKey, listClients } from '@/lib/clients-api'
import { cn } from '@/lib/utils'

interface ClientListProps {
  page: number
  onPageChange: (page: number) => void
}

export function ClientList({ page, onPageChange }: ClientListProps) {
  const query = useQuery({
    queryKey: [...clientsListQueryKey, page],
    queryFn: () => listClients({ page, limit: CLIENTS_PAGE_SIZE }),
    placeholderData: keepPreviousData,
  })

  const total = query.data?.total ?? 0
  const limit = query.data?.limit ?? CLIENTS_PAGE_SIZE
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const items = query.data?.items ?? []
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1
  const endItem = Math.min(page * limit, total)

  return (
    <Card className="border-border bg-card w-full shadow-xl shadow-primary/5 dark:shadow-black/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Clientes cadastrados</CardTitle>
        <CardDescription>
          {total === 1 ? '1 cliente na base' : `${total} clientes na base`}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4" aria-busy={query.isFetching}>
        {query.isPending && !query.data ? <ClientListSkeleton /> : null}
        {query.isError ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-destructive text-sm font-medium">
              Não foi possível carregar os clientes.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                void query.refetch()
              }}
            >
              Tentar novamente
            </Button>
          </div>
        ) : null}
        {query.isSuccess && items.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
            <div className="bg-muted mb-4 rounded-full p-3">
              <Users className="text-muted-foreground size-6" aria-hidden />
            </div>
            <h3 className="text-foreground text-base font-medium">Nenhum cliente ainda</h3>
            <p className="text-muted-foreground mt-1 max-w-sm text-sm">
              Use o formulário para cadastrar o primeiro cliente.
            </p>
          </div>
        ) : null}
        {query.isSuccess && items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <caption className="sr-only">Lista de clientes cadastrados</caption>
              <thead>
                <tr className="border-border text-muted-foreground border-b text-xs font-semibold tracking-wider uppercase">
                  <th scope="col" className="py-3 pr-4 font-semibold">
                    Nome
                  </th>
                  <th scope="col" className="py-3 pr-4 font-semibold">
                    CPF
                  </th>
                  <th scope="col" className="py-3 pr-4 font-semibold">
                    E-mail
                  </th>
                  <th scope="col" className="py-3 pr-4 font-semibold">
                    Cor
                  </th>
                  <th scope="col" className="py-3 font-semibold">
                    Cadastro
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((client) => (
                  <tr key={client.id} className="border-border/80 border-b last:border-0">
                    <td className="text-foreground py-3 pr-4 font-medium">{client.fullName}</td>
                    <td className="text-muted-foreground py-3 pr-4 font-mono tracking-wide">
                      {client.cpf}
                    </td>
                    <td className="text-muted-foreground max-w-[12rem] truncate py-3 pr-4">
                      {client.email}
                    </td>
                    <td className="py-3 pr-4">
                      <FavoriteColorBadge color={client.favoriteColor} />
                    </td>
                    <td className="text-muted-foreground whitespace-nowrap py-3">
                      {formatClientDate(client.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </CardContent>
      {totalPages > 1 ? (
        <CardFooter className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground text-sm">
            Mostrando{' '}
            <span className="text-foreground font-medium">
              {startItem}–{endItem}
            </span>{' '}
            de <span className="text-foreground font-medium">{total}</span>
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Página anterior"
              disabled={page <= 1 || query.isFetching}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft aria-hidden />
            </Button>
            <p className="text-foreground min-w-[7.5rem] text-center text-sm">
              Página {page} de {totalPages}
            </p>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Próxima página"
              disabled={page >= totalPages || query.isFetching}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight aria-hidden />
            </Button>
          </div>
        </CardFooter>
      ) : null}
    </Card>
  )
}

const SKELETON_ROW_IDS = ['row-a', 'row-b', 'row-c', 'row-d'] as const

function ClientListSkeleton() {
  return (
    <div className="space-y-3" aria-hidden>
      {SKELETON_ROW_IDS.map((rowId) => (
        <div key={rowId} className="bg-muted/70 h-10 animate-pulse rounded-md" />
      ))}
    </div>
  )
}

function FavoriteColorBadge({ color }: { color: string }) {
  const isKnownColor = isRainbowColor(color)
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={cn(
          'size-2.5 rounded-full ring-1 ring-black/15 dark:ring-white/20',
          !isKnownColor && 'bg-muted',
        )}
        style={isKnownColor ? { backgroundColor: RAINBOW_COLOR_SWATCHES[color] } : undefined}
        aria-hidden
      />
      <span className="text-foreground text-sm">
        {isKnownColor ? RAINBOW_COLOR_LABELS[color] : color}
      </span>
    </span>
  )
}

function isRainbowColor(value: string): value is RainbowColor {
  return RAINBOW_COLORS.some((color) => color === value)
}

function formatClientDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
