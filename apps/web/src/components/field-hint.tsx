import { Info } from 'lucide-react'
import { cn } from '@/lib/utils'

type FieldHintProps = {
  tip: string
  className?: string
}

export function FieldHint({ tip, className }: FieldHintProps) {
  return (
    <span className={cn('group/hint relative inline-flex', className)}>
      <button
        type="button"
        className="peer text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex size-5 cursor-pointer items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2"
        aria-label="Como preencher este campo"
      >
        <Info className="size-3.5" aria-hidden />
      </button>
      <span
        role="tooltip"
        className="bg-popover text-popover-foreground border-border pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-50 w-max max-w-[240px] -translate-x-1/2 rounded-md border px-2.5 py-1.5 text-left text-xs font-normal leading-snug shadow-lg opacity-0 transition-opacity duration-200 group-hover/hint:opacity-100 group-focus-within/hint:opacity-100 peer-focus-visible:opacity-100"
      >
        {tip}
        <span
          className="bg-popover border-border absolute top-full left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rotate-45 border-r border-b"
          aria-hidden
        />
      </span>
    </span>
  )
}
