import { useHealth } from '@/hooks/useHealth'
import { cn } from '@/lib/utils'

export function HealthBadge({ compact = false }: { compact?: boolean }) {
  const { data, isError } = useHealth()

  const ok = data?.services?.walletrpc === true && data?.services?.postgresql === true
  const status = isError || !data
    ? 'Offline'
    : !ok
      ? 'Connection Issue'
      : 'Connected'
  const whichDown =
    data && !ok
      ? [
          !data.services.walletrpc && 'Wallet',
          !data.services.postgresql && 'Database',
        ]
          .filter(Boolean)
          .join(', ')
      : null

  return (
    <div
      className={cn(
        'flex items-center gap-2',
        compact ? 'text-xs' : 'text-sm'
      )}
    >
      <span
        className={cn(
          'h-2 w-2 shrink-0 rounded-full',
          isError || !data ? 'bg-danger' : ok ? 'bg-success' : 'bg-warning'
        )}
      />
      <span className={cn(ok ? 'text-success' : 'text-danger', compact && 'text-text-secondary')}>
        {status}
      </span>
      {whichDown && !compact && (
        <span className="text-text-secondary">({whichDown})</span>
      )}
    </div>
  )
}
