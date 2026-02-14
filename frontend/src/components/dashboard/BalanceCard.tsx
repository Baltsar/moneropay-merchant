import { useBalance } from '@/hooks/useBalance'
import { XMRAmount } from '@/components/shared/XMRAmount'
import { FiatAmount } from '@/components/shared/FiatAmount'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CONFIRMATIONS_REQUIRED, MIN_PER_CONFIRMATION } from '@/lib/constants'
import { AlertCircle } from 'lucide-react'

export function BalanceCard() {
  const { data: balance, isError, refetch, isFetching } = useBalance()

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium text-text-secondary">Balance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="flex items-center gap-2 text-sm text-danger">
            <AlertCircle className="h-4 w-4 shrink-0" />
            Couldn’t load balance. Check connection.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? 'Retrying…' : 'Retry'}
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!balance) return null

  const lockedMin = balance.locked > 0 ? Math.ceil((CONFIRMATIONS_REQUIRED * MIN_PER_CONFIRMATION) / 2) : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium text-text-secondary">Balance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-wide text-text-secondary">Spendable</p>
          <XMRAmount piconero={balance.unlocked} className="text-2xl font-bold text-text-primary" />
          <FiatAmount piconero={balance.unlocked} className="block" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-text-secondary">Confirming</p>
          <XMRAmount piconero={balance.locked} className="text-xl font-semibold text-locked" />
          {balance.locked > 0 && (
            <p className="text-sm text-text-secondary">~{lockedMin} min until unlocked</p>
          )}
        </div>
        <div className="border-t border-border pt-4">
          <p className="text-xs uppercase tracking-wide text-text-secondary">Total</p>
          <XMRAmount piconero={balance.total} className="text-sm text-text-secondary" />
        </div>
      </CardContent>
    </Card>
  )
}
