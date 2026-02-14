import { HealthBadge } from '@/components/dashboard/HealthBadge'
import { useBalance } from '@/hooks/useBalance'
import { XMRAmount } from '@/components/shared/XMRAmount'
import { FiatAmount } from '@/components/shared/FiatAmount'
import { Button } from '@/components/ui/button'

export function TopBar() {
  const { data: balance, isError, refetch, isFetching } = useBalance()

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-surface px-6">
      <div className="flex items-center gap-6">
        {balance && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-secondary">Spendable</span>
            <XMRAmount piconero={balance.unlocked} className="text-lg font-semibold" />
            <FiatAmount piconero={balance.unlocked} />
          </div>
        )}
        {isError && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-danger">Balance unavailable</span>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              {isFetching ? '…' : 'Retry'}
            </Button>
          </div>
        )}
      </div>
      <HealthBadge compact />
    </header>
  )
}
