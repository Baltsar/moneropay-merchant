import { useState, useRef, useEffect } from 'react'
import { useBalance } from '@/hooks/useBalance'
import { XMRAmount } from '@/components/shared/XMRAmount'
import { FiatAmount } from '@/components/shared/FiatAmount'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CONFIRMATIONS_REQUIRED, MIN_PER_CONFIRMATION } from '@/lib/constants'
import { AlertCircle, Eye, EyeOff, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/hooks/useTranslation'
import { useBalanceVisibility } from '@/context/BalanceVisibilityContext'

const BALANCE_HIDDEN = '••••••'

function ConfirmingHelpIcon({ className }: { className?: string }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  return (
    <div ref={ref} className={cn('relative inline-flex', className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex rounded p-0.5 text-text-secondary hover:text-text-primary hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 focus:ring-offset-background"
        aria-label={t('whatDoesConfirmingMean')}
      >
        <HelpCircle className="h-4 w-4" />
      </button>
      {open && (
        <div
          className="absolute left-0 top-full z-50 mt-1 w-72 rounded-lg border border-border bg-surface p-3 text-left text-sm text-text-primary shadow-lg"
          role="tooltip"
        >
          <p className="font-medium uppercase tracking-wide text-text-secondary">{t('balanceConfirming')}</p>
          <p className="mt-1 leading-relaxed">{t('balanceConfirmingHelp')}</p>
        </div>
      )}
    </div>
  )
}

export function BalanceCard() {
  const { t } = useTranslation()
  const { balanceVisible, toggleBalanceVisible } = useBalanceVisibility()
  const { data: balance, isError, refetch, isFetching } = useBalance()

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium text-text-secondary">{t('balance')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="flex items-center gap-2 text-sm text-danger">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {t('balanceError')}
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? t('retrying') : t('retry')}
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!balance) return null

  const lockedMin = balance.locked > 0 ? Math.ceil((CONFIRMATIONS_REQUIRED * MIN_PER_CONFIRMATION) / 2) : 0
  const totalDiffers = balance.total > 0 && balance.unlocked === 0 && balance.locked === 0

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-medium text-text-secondary">{t('balance')}</CardTitle>
        <button
          type="button"
          onClick={toggleBalanceVisible}
          className="rounded p-2 text-text-secondary hover:bg-surface-hover hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
          aria-label={balanceVisible ? t('balanceHide') : t('balanceShow')}
          title={balanceVisible ? t('balanceHide') : t('balanceShow')}
        >
          {balanceVisible ? (
            <Eye className="h-5 w-5" aria-hidden />
          ) : (
            <EyeOff className="h-5 w-5" aria-hidden />
          )}
        </button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-wide text-text-secondary">{t('balanceSpendable')}</p>
          <p className="text-xs text-text-secondary/90 mt-0.5">{t('balanceSpendableHint')}</p>
          {balanceVisible ? (
            <>
              <XMRAmount piconero={balance.unlocked} className="text-2xl font-bold text-text-primary" />
              <FiatAmount piconero={balance.unlocked} className="block" />
            </>
          ) : (
            <p className="text-2xl font-bold font-mono text-text-primary tabular-nums">{BALANCE_HIDDEN}</p>
          )}
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-xs uppercase tracking-wide text-text-secondary">{t('balanceConfirming')}</p>
            <ConfirmingHelpIcon />
          </div>
          <p className="text-xs text-text-secondary/90 mt-0.5">{t('balanceConfirmingHint')}</p>
          {balanceVisible ? (
            <XMRAmount piconero={balance.locked} className="text-xl font-semibold text-locked" />
          ) : (
            <p className="text-xl font-semibold font-mono text-text-secondary tabular-nums">{BALANCE_HIDDEN}</p>
          )}
          {balance.locked > 0 && balanceVisible && (
            <p className="text-sm text-text-secondary">~{lockedMin} min until unlocked</p>
          )}
        </div>
        <div className="border-t border-border pt-4">
          <p className="text-xs uppercase tracking-wide text-text-secondary">{t('balanceTotal')}</p>
          <p className="text-xs text-text-secondary/90 mt-0.5">{t('balanceTotalHint')}</p>
          {balanceVisible ? (
            <XMRAmount piconero={balance.total} className="text-lg font-semibold text-text-primary" />
          ) : (
            <p className="text-lg font-semibold font-mono text-text-primary tabular-nums">{BALANCE_HIDDEN}</p>
          )}
          {totalDiffers && balanceVisible && (
            <p className="mt-1 text-xs text-text-secondary">{t('balanceTotalSettling')}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
