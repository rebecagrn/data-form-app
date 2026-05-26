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
