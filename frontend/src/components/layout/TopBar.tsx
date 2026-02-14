import { HealthBadge } from '@/components/dashboard/HealthBadge'
import { useBalance } from '@/hooks/useBalance'
import { XMRAmount } from '@/components/shared/XMRAmount'
import { FiatAmount } from '@/components/shared/FiatAmount'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/hooks/useTranslation'
import { useBalanceVisibility } from '@/context/BalanceVisibilityContext'
import { Eye, EyeOff, Menu } from 'lucide-react'

const BALANCE_HIDDEN = '••••••'

export function TopBar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { t } = useTranslation()
  const { balanceVisible, toggleBalanceVisible } = useBalanceVisibility()
  const { data: balance, isError, refetch, isFetching } = useBalance()

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border bg-surface px-4 sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-6">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded p-2 text-text-secondary hover:bg-surface-hover hover:text-text-primary md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        {balance && (
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="text-sm text-text-secondary shrink-0">{t('balanceSpendable')}</span>
            {balanceVisible ? (
              <>
                <XMRAmount piconero={balance.unlocked} className="text-base font-semibold shrink-0 sm:text-lg" />
                <FiatAmount piconero={balance.unlocked} className="shrink-0" />
              </>
            ) : (
              <span className="text-base font-semibold font-mono tabular-nums text-text-primary shrink-0 sm:text-lg">{BALANCE_HIDDEN}</span>
            )}
            <button
              type="button"
              onClick={toggleBalanceVisible}
              className="rounded p-1.5 text-text-secondary hover:bg-surface-hover hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
              aria-label={balanceVisible ? t('balanceHide') : t('balanceShow')}
              title={balanceVisible ? t('balanceHide') : t('balanceShow')}
            >
              {balanceVisible ? <Eye className="h-4 w-4" aria-hidden /> : <EyeOff className="h-4 w-4" aria-hidden />}
            </button>
          </div>
        )}
        {isError && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-danger">{t('balanceUnavailable')}</span>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              {isFetching ? '…' : t('retry')}
            </Button>
          </div>
        )}
      </div>
      <HealthBadge compact />
    </header>
  )
}
