import type { ReactNode } from 'react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

type FormFieldProps = {
  id: string
  label: string
  hint?: string
  error?: string
  children: ReactNode
  className?: string
}

export function FormField({
  id,
  label,
  hint,
  error,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="space-y-1">
        <Label htmlFor={id}>{label}</Label>
        {hint && (
          <p className="text-muted-foreground text-xs leading-relaxed">{hint}</p>
        )}
      </div>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-destructive text-sm font-medium">
          {error}
        </p>
      )}
    </div>
  )
}
