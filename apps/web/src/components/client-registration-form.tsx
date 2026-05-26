import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Loader2, Send, Sparkles } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { FavoriteColorField } from '@/components/favorite-color-field'
import { FormField } from '@/components/form-field'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { createClient, getApiErrorMessage } from '@/lib/clients-api'
import {
  showSubmitErrorToast,
  showSubmitSuccessToast,
} from '@/lib/show-submit-toast'
import {
  clientFormSchema,
  type ClientFormValues,
} from '@/lib/schemas/client-form.schema'
import { formatCpf } from '@/lib/validators/cpf'

const defaultValues: ClientFormValues = {
  fullName: '',
  cpf: '',
  email: '',
  favoriteColor: 'blue',
  notes: undefined,
}

export function ClientRegistrationForm() {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues,
  })

  const mutation = useMutation({
    mutationFn: (payload: ClientFormValues) => createClient(payload),
    onSuccess: () => {
      reset(defaultValues)
      showSubmitSuccessToast()
    },
    onError: (error) => {
      showSubmitErrorToast(getApiErrorMessage(error))
    },
  })

  const handleFormSubmit = (values: ClientFormValues) => {
    const trimmedNotes = values.notes?.trim()
    mutation.mutate({
      ...values,
      cpf: values.cpf.replace(/\D/g, ''),
      notes: trimmedNotes && trimmedNotes.length > 0 ? trimmedNotes : undefined,
    })
  }

  return (
    <div className="w-full max-w-lg space-y-6">
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

      <Card className="border-border bg-card shadow-xl shadow-primary/5 dark:shadow-black/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Dados do cliente</CardTitle>
          <CardDescription>
            Passe o mouse no ícone de informação para ver como preencher cada
            campo.
          </CardDescription>
        </CardHeader>
        <Separator />
        <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
          <CardContent className="space-y-5 pt-6">
            <FormField
              id="fullName"
              label="Nome completo"
              tip="Informe nome e sobrenome, como no documento."
              error={errors.fullName?.message}
            >
              <Input
                id="fullName"
                autoComplete="name"
                placeholder="Ex.: Maria Silva"
                className="h-10"
                aria-invalid={Boolean(errors.fullName)}
                aria-describedby={
                  errors.fullName ? 'fullName-error' : undefined
                }
                {...register('fullName')}
              />
            </FormField>

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                id="cpf"
                label="CPF"
                tip="Digite os 11 dígitos; a máscara é aplicada automaticamente."
                error={errors.cpf?.message}
              >
                <Input
                  id="cpf"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="000.000.000-00"
                  className="h-10 font-mono tracking-wide"
                  aria-invalid={Boolean(errors.cpf)}
                  aria-describedby={errors.cpf ? 'cpf-error' : undefined}
                  {...register('cpf', {
                    onChange: (event) => {
                      setValue('cpf', formatCpf(event.target.value), {
                        shouldValidate: true,
                      })
                    },
                  })}
                />
              </FormField>

              <FormField
                id="email"
                label="E-mail"
                tip="Use um e-mail válido para contato com o cliente."
                error={errors.email?.message}
              >
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="cliente@email.com"
                  className="h-10"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  {...register('email')}
                />
              </FormField>
            </div>

            <FavoriteColorField
              control={control}
              error={errors.favoriteColor}
            />

            <FormField
              id="notes"
              label="Observações"
              tip="Opcional. Ex.: cliente indicado ou preferência de contato."
              error={errors.notes?.message}
            >
              <Textarea
                id="notes"
                rows={3}
                placeholder="Ex.: cliente indicado, horário preferido de contato..."
                className="resize-none"
                aria-invalid={Boolean(errors.notes)}
                aria-describedby={errors.notes ? 'notes-error' : undefined}
                {...register('notes')}
              />
            </FormField>
          </CardContent>
          <CardFooter className="flex-col gap-3 border-t bg-muted/40 pt-6">
            <Button
              type="submit"
              size="lg"
              className="h-11 w-full shadow-md"
              disabled={mutation.isPending}
              aria-busy={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden />
                  Enviando...
                </>
              ) : (
                <>
                  <Send aria-hidden />
                  Enviar cadastro
                </>
              )}
            </Button>
            <p className="text-muted-foreground text-center text-xs">
              Ao enviar, você confirma que os dados estão corretos.
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
