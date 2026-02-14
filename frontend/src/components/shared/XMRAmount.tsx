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
  return (
    <span className={cn('font-mono tabular-nums', className)}>
      {formatXMR(piconero)}
      {suffix}
    </span>
  )
}
