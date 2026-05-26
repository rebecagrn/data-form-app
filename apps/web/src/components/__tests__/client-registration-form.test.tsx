import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ClientRegistrationForm } from '@/components/client-registration-form'
import { createClient } from '@/lib/clients-api'
import { useUiStore } from '@/stores/ui.store'

jest.mock('@/lib/clients-api', () => ({
  createClient: jest.fn(),
  getApiErrorMessage: jest.fn(() => 'Erro da API'),
}))

const mockedCreateClient = createClient as jest.MockedFunction<
  typeof createClient
>

const renderForm = () => {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <ClientRegistrationForm />
    </QueryClientProvider>,
  )
}

describe('ClientRegistrationForm', () => {
  beforeEach(() => {
    useUiStore.setState({ submitFeedback: null })
    mockedCreateClient.mockReset()
  })

  it('should show validation errors for invalid fields', async () => {
    const user = userEvent.setup()
    renderForm()
    await user.click(screen.getByRole('button', { name: /enviar cadastro/i }))
    expect(await screen.findByText('Nome deve ter pelo menos 3 caracteres')).toBeInTheDocument()
    expect(screen.getByText('CPF inválido')).toBeInTheDocument()
    expect(mockedCreateClient).not.toHaveBeenCalled()
  })

  it('should submit valid data and show success message', async () => {
    const user = userEvent.setup()
    mockedCreateClient.mockResolvedValue({
      id: 'uuid-1',
      fullName: 'John Doe',
      cpf: '52998224725',
      email: 'john@example.com',
      favoriteColor: 'blue',
      notes: null,
      createdAt: '2026-05-26T00:00:00.000Z',
    })
    renderForm()
    await user.type(screen.getByLabelText(/nome completo/i), 'John Doe')
    await user.type(screen.getByLabelText(/^cpf$/i), '52998224725')
    await user.type(screen.getByLabelText(/e-mail/i), 'john@example.com')
    await user.click(screen.getByRole('button', { name: /enviar cadastro/i }))
    await waitFor(() => {
      expect(mockedCreateClient).toHaveBeenCalledWith(
        expect.objectContaining({
          fullName: 'John Doe',
          cpf: '52998224725',
          email: 'john@example.com',
          favoriteColor: 'blue',
          notes: undefined,
        }),
      )
    })
    expect(
      await screen.findByText('Cadastro realizado com sucesso!'),
    ).toBeInTheDocument()
  })
})
