import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { XMRAmount } from '@/components/shared/XMRAmount'
import { StatusHelpIcon, type PaymentStatusType } from '@/components/shared/StatusHelpIcon'
import { useRecentPayments } from '@/context/RecentPaymentsContext'
import { CONFIRMATIONS_REQUIRED } from '@/lib/constants'
import { Trash2, ArrowUpRight } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

type PaymentStatus = PaymentStatusType

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

function shortAddress(addr: string): string {
  if (!addr || addr.length <= 16) return addr || '—'
  return `${addr.slice(0, 8)}…${addr.slice(-6)}`
}

export interface RecentReceiveActivity {
  type: 'receive'
  createdAt: number
  address: string
  amount: number
  description?: string
  complete: boolean
  transactions: { confirmations: number; double_spend_seen: boolean }[]
  /** When the receive-status query failed for this row */
  loadError?: boolean
  onRetry?: () => void
}

export interface RecentSendActivity {
  type: 'send'
  createdAt: number
  txHash: string
  amount: number
  destinationAddress: string
  confirmations: number
  locked: boolean
}

export type RecentActivity = RecentReceiveActivity | RecentSendActivity

export function RecentPayments({
  activities,
  addPastSend,
}: {
  activities: RecentActivity[]
  addPastSend?: React.ReactNode
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { removePayment, removeSend } = useRecentPayments()
  const list = activities.slice(0, 25)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium text-text-secondary">{t('recentPayments')}</CardTitle>
      </CardHeader>
      <CardContent>
        {list.length === 0 ? (
          <p className="text-sm text-text-secondary">{t('noPaymentsYet')}</p>
        ) : (
          <ul className="space-y-3">
            {list.map((a) => {
              if (a.type === 'receive') {
                if (a.loadError && a.onRetry) {
                  return (
                    <li
                      key={a.address}
                      className="flex flex-wrap items-center justify-between gap-2 rounded border border-border bg-background p-3"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          navigate('/receive', {
                            state: { address: a.address, amount: a.amount, description: a.description },
                          })
                        }
                        className="flex-1 min-w-0 text-left rounded hover:bg-surface-hover transition-colors -m-1 p-1"
                        title={t('viewPayment')}
                      >
                        <p className="font-mono text-sm text-text-primary">
                          <XMRAmount piconero={a.amount} suffix="" /> XMR
                        </p>
                        {a.description && (
                          <p className="text-xs text-text-secondary">{a.description}</p>
                        )}
                      </button>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-danger">{t('recentPaymentLoadError')}</span>
                        <Button type="button" variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); a.onRetry?.() }}>
                          {t('retry')}
                        </Button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            removePayment(a.address)
                          }}
                          className="rounded p-1.5 text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                          title={t('removeFromList')}
                          aria-label={t('removeFromList')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  )
                }
                const status = getStatus(a.complete, a.transactions)
                const conf = a.transactions[0]?.confirmations ?? 0
                return (
                  <li
                    key={a.address}
                    className="flex flex-wrap items-center justify-between gap-2 rounded border border-border bg-background p-3"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        navigate('/receive', {
                          state: { address: a.address, amount: a.amount, description: a.description },
                        })
                      }
                      className="flex-1 min-w-0 text-left rounded hover:bg-surface-hover transition-colors -m-1 p-1"
                      title={t('viewPayment')}
                    >
                      <p className="font-mono text-sm text-text-primary">
                        <XMRAmount piconero={a.amount} suffix="" /> XMR
                      </p>
                      {a.description && (
                        <p className="text-xs text-text-secondary">{a.description}</p>
                      )}
                    </button>
                    <div className="flex items-center gap-1.5">
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
                        {status === 'complete' && t('statusComplete')}
                        {status === 'confirming' && `${conf}/${CONFIRMATIONS_REQUIRED}`}
                        {status === 'double_spend' && t('statusDoubleSpend')}
                        {status === 'waiting' && t('statusWaiting')}
                      </Badge>
                      <StatusHelpIcon status={status} />
                      {status === 'waiting' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            removePayment(a.address)
                          }}
                          className="rounded p-1.5 text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                          title={t('removeFromList')}
                          aria-label={t('removeFromList')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </li>
                )
              }
              const isConfirmed = a.confirmations >= CONFIRMATIONS_REQUIRED && !a.locked
              return (
                <li
                  key={a.txHash}
                  className="flex flex-wrap items-center justify-between gap-2 rounded border border-border bg-background p-3"
                >
                  <div className="flex-1 min-w-0 flex items-center gap-2">
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-text-secondary" aria-hidden />
                    <div>
                      <p className="font-mono text-sm text-text-primary">
                        <XMRAmount piconero={a.amount} suffix="" /> XMR
                      </p>
                      <p className="text-xs text-text-secondary">
                        {t('sentToLabel')}: {shortAddress(a.destinationAddress)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant={isConfirmed ? 'success' : 'warning'}>
                      {isConfirmed ? t('sent') : `${a.confirmations}/${CONFIRMATIONS_REQUIRED}`}
                    </Badge>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeSend(a.txHash)
                      }}
                      className="rounded p-1.5 text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                      title={t('removeFromList')}
                      aria-label={t('removeFromList')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
        {addPastSend}
      </CardContent>
    </Card>
  )
}
