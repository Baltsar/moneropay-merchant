import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { XMRAmount } from '@/components/shared/XMRAmount'
import { CONFIRMATIONS_REQUIRED } from '@/lib/constants'

type PaymentStatus = 'complete' | 'confirming' | 'double_spend' | 'waiting'

function getStatus(
  complete: boolean,
  transactions: { confirmations: number; double_spend_seen: boolean }[]
): PaymentStatus {
  const tx = transactions[0]
  if (tx?.double_spend_seen) return 'double_spend'
  if (complete) return 'complete'
  if (tx && tx.confirmations > 0) return 'confirming'
  return 'waiting'
}

export interface RecentPaymentItem {
  address: string
  amount: number
  description?: string
  complete: boolean
  transactions: { confirmations: number; double_spend_seen: boolean }[]
}

export function RecentPayments({ payments }: { payments: RecentPaymentItem[] }) {
  const list = payments.slice(0, 20)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium text-text-secondary">Recent Payments</CardTitle>
      </CardHeader>
      <CardContent>
        {list.length === 0 ? (
          <p className="text-sm text-text-secondary">No payments yet</p>
        ) : (
          <ul className="space-y-3">
            {list.map((p) => {
              const status = getStatus(p.complete, p.transactions)
              const conf = p.transactions[0]?.confirmations ?? 0
              return (
                <li
                  key={p.address}
                  className="flex flex-wrap items-center justify-between gap-2 rounded border border-border bg-background p-3"
                >
                  <div>
                    <p className="font-mono text-sm text-text-primary">
                      <XMRAmount piconero={p.amount} suffix="" /> XMR
                    </p>
                    {p.description && (
                      <p className="text-xs text-text-secondary">{p.description}</p>
                    )}
                  </div>
                  <Badge
                    variant={
                      status === 'complete'
                        ? 'success'
                        : status === 'double_spend'
                          ? 'danger'
                          : status === 'confirming'
                            ? 'warning'
                            : 'secondary'
                    }
                    className={status === 'double_spend' ? 'animate-pulse' : ''}
                  >
                    {status === 'complete' && 'Complete'}
                    {status === 'confirming' && `${conf}/${CONFIRMATIONS_REQUIRED}`}
                    {status === 'double_spend' && 'Double Spend'}
                    {status === 'waiting' && 'Waiting'}
                  </Badge>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
