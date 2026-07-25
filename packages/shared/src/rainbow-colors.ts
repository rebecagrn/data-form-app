export const RAINBOW_COLORS = [
  'red',
  'orange',
  'yellow',
  'green',
  'blue',
  'indigo',
  'violet',
] as const

export type RainbowColor = (typeof RAINBOW_COLORS)[number]

export const RAINBOW_COLOR_LABELS: Record<RainbowColor, string> = {
  red: 'Vermelho',
  orange: 'Laranja',
  yellow: 'Amarelo',
  green: 'Verde',
  blue: 'Azul',
  indigo: 'Anil',
  violet: 'Violeta',
}

export const RAINBOW_COLOR_SWATCHES: Record<RainbowColor, string> = {
  red: '#ef4444',
  orange: '#f97316',
  yellow: '#eab308',
  green: '#22c55e',
  blue: '#3b82f6',
  indigo: '#6366f1',
  violet: '#8b5cf6',
}
