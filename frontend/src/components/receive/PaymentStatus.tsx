import { usePaymentStatus } from '@/hooks/usePaymentStatus'
import { ConfirmationProgress } from '@/components/shared/ConfirmationProgress'
import { DoubleSpendAlert } from '@/components/shared/DoubleSpendAlert'
import { QRCodeDisplay } from './QRCode'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { XMRAmount } from '@/components/shared/XMRAmount'
import { Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'

export function PaymentStatus({
  address,
  amountPiconero,
  description,
  onNewPayment,
}: {
  address: string
  amountPiconero: number
  description?: string
  onNewPayment: () => void
}) {
  const { t } = useTranslation()
  const { data, isLoading, isError, refetch, isFetching } = usePaymentStatus(address, true)
  const [copied, setCopied] = useState<'address' | 'amount' | null>(null)

  const copy = (text: string, key: 'address' | 'amount') => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  const hasTx = data?.transactions && data.transactions.length > 0
  const tx = hasTx ? data!.transactions[0] : null
  const doubleSpend = tx?.double_spend_seen ?? false
  const complete = data?.complete ?? false
  const partial = data && data.amount.covered.total < data.amount.expected
  const partialPct =
    data && data.amount.expected > 0
      ? Math.min(100, (data.amount.covered.total / data.amount.expected) * 100)
      : 0

  return (
    <div className="space-y-6">
      {doubleSpend && tx && <DoubleSpendAlert txHash={tx.tx_hash} />}
      <div className="flex flex-col items-center gap-4">
        <QRCodeDisplay
          address={address}
          amountPiconero={amountPiconero}
          description={description}
        />
        <div className="flex flex-wrap items-center justify-center gap-2">
          <code className="rounded bg-surface-hover px-2 py-1 font-mono text-sm text-text-primary">
            {address.slice(0, 12)}...{address.slice(-8)}
          </code>
          <Button
            variant="outline"
            size="sm"
            onClick={() => copy(address, 'address')}
          >
            {copied === 'address' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {t('copyLabel')}
          </Button>
          <span className="text-text-secondary">|</span>
          <XMRAmount piconero={amountPiconero} />
          <Button
            variant="outline"
            size="sm"
            onClick={() => copy((amountPiconero / 1e12).toFixed(12), 'amount')}
          >
            {copied === 'amount' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {t('copyLabel')}
          </Button>
        </div>
        {!complete && (
          <p className="flex items-center gap-2 text-sm text-text-secondary">
            <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
            {t('waitingForPayment')}
          </p>
        )}
      </div>

      {partial && !complete && (
        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="text-sm font-medium text-text-primary">
            {description ?? t('receive')} — {t('partial')}
          </p>
          <Progress value={partialPct} className="my-2 h-2" />
          <p className="text-sm text-text-secondary">
            <XMRAmount piconero={data!.amount.covered.total} suffix="" /> /{' '}
            <XMRAmount piconero={data!.amount.expected} suffix="" /> XMR ({partialPct.toFixed(0)}%)
          </p>
          <p className="text-xs text-text-secondary">{t('waitingForMore')}</p>
        </div>
      )}

      {hasTx && tx && (
        <ConfirmationProgress confirmations={tx.confirmations} locked={tx.locked} />
      )}

      {complete && (
        <div className="rounded-lg border border-success/50 bg-success/10 p-4 text-center">
          <p className="font-medium text-success">{t('paymentComplete')}</p>
          <Button className="mt-2" onClick={onNewPayment}>
            {t('newPayment')}
          </Button>
        </div>
      )}

      {isLoading && !data && (
        <p className="text-center text-sm text-text-secondary">{t('loadingStatus')}</p>
      )}

      {isError && (
        <div className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-center">
          <p className="text-sm text-danger">{t('troubleLoadingStatus')}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            {isFetching ? t('retrying') : t('retry')}
          </Button>
        </div>
      )}
    </div>
  )
}
