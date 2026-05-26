import { Toaster as Sonner, type ToasterProps } from 'sonner'
import { useTheme } from '@/hooks/use-theme'

export function Toaster(props: ToasterProps) {
  const { theme } = useTheme()

  return (
    <Sonner
      theme={theme}
      position="top-right"
      closeButton
      richColors={false}
      toastOptions={{
        classNames: {
          toast:
            'group toast !rounded-xl !border !border-border !bg-popover !text-popover-foreground !shadow-2xl !shadow-black/10 dark:!shadow-black/40',
          title: '!text-sm !font-semibold tracking-tight',
          description: '!text-sm !text-muted-foreground leading-relaxed',
          closeButton:
            '!bg-transparent !text-muted-foreground hover:!text-foreground !border-border hover:!border-border/80',
          success:
            '!border-emerald-500/35 !bg-[linear-gradient(135deg,rgba(16,185,129,0.16),rgba(16,185,129,0.06))] dark:!border-emerald-400/30 dark:!bg-[linear-gradient(135deg,rgba(16,185,129,0.18),rgba(16,185,129,0.06))]',
          error:
            '!border-destructive/35 !bg-[linear-gradient(135deg,rgba(239,68,68,0.16),rgba(239,68,68,0.06))] dark:!border-destructive/40 dark:!bg-[linear-gradient(135deg,rgba(239,68,68,0.18),rgba(239,68,68,0.06))]',
          icon: 'group-[.toast]:!text-foreground opacity-90',
        },
      }}
      {...props}
    />
  )
}
