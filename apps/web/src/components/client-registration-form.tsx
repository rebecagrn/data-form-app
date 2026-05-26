import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Loader2, Send, Sparkles } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { FavoriteColorField } from '@/components/favorite-color-field'
import { FormField } from '@/components/form-field'
import { SubmitFeedback } from '@/components/submit-feedback'
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
  clientFormSchema,
  type ClientFormValues,
} from '@/lib/schemas/client-form.schema'
import { formatCpf } from '@/lib/validators/cpf'
import { useUiStore } from '@/stores/ui.store'

const defaultValues: ClientFormValues = {
  fullName: '',
  cpf: '',
  email: '',
  favoriteColor: 'blue',
  notes: undefined,
}

export function ClientRegistrationForm() {
  const setSubmitFeedback = useUiStore((state) => state.setSubmitFeedback)

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
      setSubmitFeedback({
        type: 'success',
        message: 'Cadastro realizado com sucesso!',
      })
    },
    onError: (error) => {
      setSubmitFeedback({
        type: 'error',
        message: getApiErrorMessage(error),
      })
    },
  })

  const handleFormSubmit = (values: ClientFormValues) => {
    setSubmitFeedback(null)
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
        <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-2xl shadow-sm ring-1 ring-primary/15">
          <Sparkles className="size-6" aria-hidden />
        </div>
        <div className="space-y-1">
          <p className="text-primary text-xs font-semibold uppercase tracking-widest">
            Data Form App
          </p>
          <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
            Cadastro de clientes
          </h1>
          <p className="text-muted-foreground mx-auto max-w-sm text-sm leading-relaxed">
            Colete nome, CPF, e-mail e cor preferida. Cada cliente só pode se
            cadastrar uma vez.
          </p>
        </div>
      </div>

      <SubmitFeedback />

      <Card className="border-border/60 bg-card/80 shadow-lg shadow-primary/5 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Dados do cliente</CardTitle>
          <CardDescription>
            Campos obrigatórios marcados pelo formulário. Revise antes de enviar.
          </CardDescription>
        </CardHeader>
        <Separator className="opacity-60" />
        <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
          <CardContent className="space-y-5 pt-6">
            <FormField
              id="fullName"
              label="Nome completo"
              error={errors.fullName?.message}
            >
              <Input
                id="fullName"
                autoComplete="name"
                placeholder="Ex.: Maria Silva"
                className="h-10 bg-background/80"
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
                hint="Somente números; formatamos automaticamente."
                error={errors.cpf?.message}
              >
                <Input
                  id="cpf"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="000.000.000-00"
                  className="h-10 bg-background/80 font-mono tracking-wide"
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
                error={errors.email?.message}
              >
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="cliente@email.com"
                  className="h-10 bg-background/80"
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
              hint="Opcional — contexto do negócio ou preferências."
              error={errors.notes?.message}
            >
              <Textarea
                id="notes"
                rows={3}
                placeholder="Ex.: cliente indicado, horário preferido de contato..."
                className="resize-none bg-background/80"
                aria-invalid={Boolean(errors.notes)}
                aria-describedby={errors.notes ? 'notes-error' : undefined}
                {...register('notes')}
              />
            </FormField>
          </CardContent>
          <CardFooter className="flex-col gap-3 border-t border-border/60 bg-muted/30 pt-6">
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
