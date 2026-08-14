import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ClientList } from '@/components/client-list'
import { listClients } from '@/lib/clients-api'

jest.mock('@/lib/clients-api', () => ({
  CLIENTS_PAGE_SIZE: 20,
  clientsListQueryKey: ['clients', 'list'],
  listClients: jest.fn(),
}))

const mockedListClients = listClients as jest.MockedFunction<typeof listClients>

const renderList = (page = 1, onPageChange = jest.fn()) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return {
    onPageChange,
    ...render(
      <QueryClientProvider client={queryClient}>
        <ClientList page={page} onPageChange={onPageChange} />
      </QueryClientProvider>,
    ),
  }
}

describe('ClientList', () => {
  beforeEach(() => {
    mockedListClients.mockReset()
  })

  it('should show an empty state when there are no clients', async () => {
    mockedListClients.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
    })
    renderList()
    expect(await screen.findByText('Nenhum cliente ainda')).toBeInTheDocument()
    expect(
      screen.getByText('Use o formulário para cadastrar o primeiro cliente.'),
    ).toBeInTheDocument()
  })

  it('should render listed clients with masked CPF', async () => {
    mockedListClients.mockResolvedValue({
      items: [
        {
          id: 'uuid-1',
          fullName: 'Maria Silva',
          cpf: '***.***.***-25',
          email: 'maria@example.com',
          favoriteColor: 'blue',
          notes: null,
          createdAt: '2026-05-26T00:00:00.000Z',
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
    })
    renderList()
    expect(await screen.findByText('Maria Silva')).toBeInTheDocument()
    expect(screen.getByText('***.***.***-25')).toBeInTheDocument()
    expect(screen.getByText('maria@example.com')).toBeInTheDocument()
    expect(screen.getByText('Azul')).toBeInTheDocument()
    expect(screen.queryByText('52998224725')).not.toBeInTheDocument()
  })

  it('should show an error and retry the request', async () => {
    const user = userEvent.setup()
    mockedListClients.mockRejectedValueOnce(new Error('network')).mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
    })
    renderList()
    expect(await screen.findByText('Não foi possível carregar os clientes.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /tentar novamente/i }))
    expect(await screen.findByText('Nenhum cliente ainda')).toBeInTheDocument()
  })

  it('should request the next page', async () => {
    const user = userEvent.setup()
    mockedListClients.mockResolvedValue({
      items: [
        {
          id: 'uuid-1',
          fullName: 'Maria Silva',
          cpf: '***.***.***-25',
          email: 'maria@example.com',
          favoriteColor: 'blue',
          notes: null,
          createdAt: '2026-05-26T00:00:00.000Z',
        },
      ],
      total: 25,
      page: 1,
      limit: 20,
    })
    const { onPageChange } = renderList(1)
    expect(await screen.findByText('Página 1 de 2')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Próxima página' }))
    await waitFor(() => {
      expect(onPageChange).toHaveBeenCalledWith(2)
    })
  })
})
