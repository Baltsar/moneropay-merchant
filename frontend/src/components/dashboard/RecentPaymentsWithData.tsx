import { useState } from 'react'
import { useQueries } from '@tanstack/react-query'
import { useRecentPayments } from '@/context/RecentPaymentsContext'
import { moneropayApi } from '@/api/moneropay'
import { RecentPayments } from './RecentPayments'
import { useTranslation } from '@/hooks/useTranslation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function RecentPaymentsWithData() {
  const { t } = useTranslation()
  const { items, sends, addSend } = useRecentPayments()
  const [showAddPast, setShowAddPast] = useState(false)
  const [pastTxHash, setPastTxHash] = useState('')
  const [pastError, setPastError] = useState<string | null>(null)

  const receiveQueries = useQueries({
    queries: items.map((item) => ({
      queryKey: ['receive', item.address],
      queryFn: () => moneropayApi.getReceive(item.address),
      refetchInterval: 15_000,
    })),
  })

  const sendQueries = useQueries({
    queries: sends.map((s) => ({
      queryKey: ['transfer', s.txHash],
      queryFn: () => moneropayApi.getTransfer(s.txHash),
      refetchInterval: 15_000,
    })),
  })

  const receiveActivities = items.map((item, i) => {
    const q = receiveQueries[i]
    const res = q?.data
    return {
      type: 'receive' as const,
      createdAt: item.createdAt ?? 0,
      address: item.address,
      amount: item.amount,
      description: item.description,
      complete: res?.complete ?? false,
      transactions: res?.transactions ?? [],
      loadError: q?.isError ?? false,
      onRetry: q?.refetch ? () => q.refetch() : undefined,
    }
  })

  const sendActivities = sends.map((s, i) => {
    const res = sendQueries[i]?.data
    const tx = res?.transactions?.[0]
    return {
      type: 'send' as const,
      createdAt: s.createdAt,
      txHash: s.txHash,
      amount: s.amount,
      destinationAddress: s.destinationAddress,
      confirmations: tx?.confirmations ?? 0,
      locked: tx?.locked ?? true,
    }
  })

  const activities = [...receiveActivities, ...sendActivities].sort(
    (a, b) => b.createdAt - a.createdAt
  )

  const handleAddPastSend = async () => {
    const hash = pastTxHash.trim()
    if (!hash) return
    setPastError(null)
    try {
      const r = await moneropayApi.getTransfer(hash)
      const tx = r.transactions?.[0]
      if (tx) {
        addSend({
          txHash: hash,
          amount: tx.amount,
          destinationAddress: '',
        })
        setPastTxHash('')
        setShowAddPast(false)
      } else {
        setPastError(t('addPastSendNotFound'))
      }
    } catch {
      setPastError(t('addPastSendNotFound'))
    }
  }

  return (
    <RecentPayments
        activities={activities}
        addPastSend={
          <div className="mt-3 space-y-2 border-t border-border pt-3">
            {!showAddPast ? (
              <button
                type="button"
                onClick={() => setShowAddPast(true)}
                className="text-xs text-accent hover:underline"
              >
                {t('addPastSend')}
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  placeholder={t('addPastSendPlaceholder')}
                  value={pastTxHash}
                  onChange={(e) => setPastTxHash(e.target.value)}
                  className="font-mono text-sm flex-1 min-w-[200px]"
                />
                <Button size="sm" onClick={handleAddPastSend} disabled={!pastTxHash.trim()}>
                  {t('addPastSendAdd')}
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddPast(false)
                    setPastTxHash('')
                    setPastError(null)
                  }}
                  className="text-xs text-text-secondary hover:underline"
                >
                  {t('cancel')}
                </button>
              </div>
            )}
            {pastError && <p className="text-xs text-danger">{pastError}</p>}
          </div>
        }
      />
  )
}
