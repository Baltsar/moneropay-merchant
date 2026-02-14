import { formatXMR } from '@/lib/utils'
import { cn } from '@/lib/utils'

export function XMRAmount({
  piconero,
  className,
  suffix = ' XMR',
}: {
  piconero: number
  className?: string
  suffix?: string
}) {
  const safe = typeof piconero === 'number' && Number.isFinite(piconero) ? piconero : 0
  return (
    <span className={cn('font-mono tabular-nums', className)}>
      {formatXMR(safe)}
      {suffix}
    </span>
  )
}
