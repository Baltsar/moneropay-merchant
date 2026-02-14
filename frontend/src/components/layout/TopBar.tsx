import { HealthBadge } from '@/components/dashboard/HealthBadge'
import { useBalance } from '@/hooks/useBalance'
import { XMRAmount } from '@/components/shared/XMRAmount'
import { FiatAmount } from '@/components/shared/FiatAmount'

export function TopBar() {
  const { data: balance } = useBalance()

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
      </div>
      <HealthBadge compact />
    </header>
  )
}
