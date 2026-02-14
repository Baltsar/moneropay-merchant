import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useBalance } from '@/hooks/useBalance'
import { useFiatCurrency } from '@/context/FiatCurrencyContext'
import { useXMRPrice } from '@/hooks/useXMRPrice'
import { xmrToPiconero } from '@/lib/utils'
import { XMRAmount } from '@/components/shared/XMRAmount'
import { FiatAmount } from '@/components/shared/FiatAmount'
import { CONFIRMATIONS_REQUIRED, MIN_PER_CONFIRMATION } from '@/lib/constants'
import { useTranslation } from '@/hooks/useTranslation'
import { useRecentPayments } from '@/context/RecentPaymentsContext'

const ESTIMATED_FEE_PICONERO = Math.round(0.0001 * 1e12)
const MONERO_ADDRESS_LENGTHS = [95, 97, 106] as const
const BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

function validateAddress(addr: string): boolean {
  const t = addr.trim()
  if (t.length === 0) return true
  if (!MONERO_ADDRESS_LENGTHS.includes(t.length as 95 | 97 | 106)) return false
  if (t[0] !== '4' && t[0] !== '8') return false
  for (let i = 0; i < t.length; i++) {
    if (!BASE58.includes(t[i])) return false
  }
  return true
}

export function SendForm() {
  const [address, setAddress] = useState('')
  const [amountInput, setAmountInput] = useState('')
  const [isXMR, setIsXMR] = useState(true)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ txHash: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [transferFailed, setTransferFailed] = useState(false)
  const [addressTouched, setAddressTouched] = useState(false)

  const { t } = useTranslation()
  const { addSend } = useRecentPayments()
  const { fiatCurrency } = useFiatCurrency()
  const { data: priceMap } = useXMRPrice()
  const { data: balance, isLoading: balanceLoading } = useBalance()
  const rate = priceMap?.[fiatCurrency.toLowerCase()] ?? priceMap?.usd ?? 0

  const amountXMRNum = (() => {
    const n = parseFloat(amountInput)
    if (Number.isNaN(n) || n < 0) return 0
    if (isXMR) return n
    return rate > 0 ? n / rate : 0
  })()
  const amountPiconero = xmrToPiconero(amountXMRNum)
  const unlocked = balance?.unlocked ?? 0
  const locked = balance?.locked ?? 0
  const insufficient = amountPiconero > 0 && amountPiconero > unlocked
  const lockedMin = locked > 0 ? Math.ceil((CONFIRMATIONS_REQUIRED * MIN_PER_CONFIRMATION) / 2) : 0
  const addressValid = address.trim() === '' || validateAddress(address.trim())
  const maxSpendable = Math.max(0, unlocked - ESTIMATED_FEE_PICONERO)
  const pendingTx = unlocked === 0 && locked > 0

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setTransferFailed(false)
    if (!addressValid || address.trim().length === 0) {
      setError(t('invalidMoneroAddress'))
      setAddressTouched(true)
      return
    }
    if (amountPiconero <= 0) {
      setError(t('enterValidAmountSend'))
      return
    }
    if (insufficient) {
      setError(
        t('insufficientBalance', {
          unlocked: (unlocked / 1e12).toFixed(4),
          locked: (locked / 1e12).toFixed(4),
          min: lockedMin,
        })
      )
      return
    }
    setConfirmOpen(true)
  }

  const handleSend = async () => {
    setSending(true)
    setError(null)
    try {
      const { moneropayApi } = await import('@/api/moneropay')
      const res = await moneropayApi.postTransfer({
        destinations: [{ amount: amountPiconero, address: address.trim() }],
      })
      addSend({
        txHash: res.tx_hash,
        amount: res.amount,
        destinationAddress: res.destinations?.[0]?.address ?? address.trim(),
      })
      setResult({ txHash: res.tx_hash })
      setConfirmOpen(false)
      setAddress('')
      setAmountInput('')
    } catch (err) {
      setTransferFailed(true)
      setError(err instanceof Error ? err.message : t('transferFailed'))
      setConfirmOpen(false)
    } finally {
      setSending(false)
    }
  }

  if (result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium text-success">{t('sent')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-mono text-sm text-text-primary break-all">{result.txHash}</p>
          <Button
            className="mt-2"
            variant="outline"
            size="sm"
            onClick={() => navigator.clipboard.writeText(result.txHash)}
          >
            {t('copyTxHash')}
          </Button>
          <Button className="mt-2 ml-2" variant="secondary" onClick={() => setResult(null)}>
            {t('sendAgain')}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium text-text-secondary">{t('sendXMR')}</CardTitle>
      </CardHeader>
      <CardContent>
        {pendingTx && (
          <p className="mb-4 rounded-lg border border-border bg-surface-hover px-4 py-3 text-sm text-text-secondary">
            {t('pendingTxMessage')}
          </p>
        )}
        <form onSubmit={handleReview} className="space-y-4">
          <div>
            <label className="text-sm text-text-secondary">{t('recipientAddress')}</label>
            <Input
              className="mt-1 font-mono text-sm"
              placeholder={t('addressPlaceholder')}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onBlur={() => setAddressTouched(true)}
            />
            {(addressTouched || address.trim().length > 0) && !addressValid && address.trim().length > 0 && (
              <p className="mt-1 text-sm text-danger">{t('invalidMoneroAddress')}</p>
            )}
          </div>
          <div>
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => setIsXMR(false)}
                className={`rounded px-3 py-1 text-sm ${!isXMR ? 'bg-accent text-white' : 'bg-surface-hover text-text-secondary'}`}
              >
                {fiatCurrency}
              </button>
              <button
                type="button"
                onClick={() => setIsXMR(true)}
                className={`rounded px-3 py-1 text-sm ${isXMR ? 'bg-accent text-white' : 'bg-surface-hover text-text-secondary'}`}
              >
                XMR
              </button>
            </div>
            <label className="text-sm text-text-secondary">
              {t('amount')} {isXMR ? '(XMR)' : `(${fiatCurrency})`}
            </label>
            <div className="flex gap-2 items-center">
              <Input
                type="number"
                step={isXMR ? '0.0001' : '0.01'}
                min="0"
                placeholder={isXMR ? '0.3500' : '50.00'}
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsXMR(true)
                  setAmountInput((maxSpendable / 1e12).toFixed(4))
                }}
                disabled={balanceLoading || maxSpendable <= 0}
                title={t('sendMaxTitle')}
              >
                {t('sendMax')}
              </Button>
            </div>
            <p className="mt-1 text-sm text-text-secondary">
              {isXMR
                ? amountPiconero > 0 && (
                    <>
                      <FiatAmount piconero={amountPiconero} className="inline" />
                    </>
                  )
                : amountXMRNum > 0 && (
                    <>
                      = {amountXMRNum.toFixed(4)} XMR
                    </>
                  )}
            </p>
          </div>
          {balanceLoading && !balance && (
            <p className="text-sm text-text-secondary">{t('loadingBalance')}</p>
          )}
          {balance && (
            <p className="text-sm text-text-secondary">
              {t('available')}: <XMRAmount piconero={balance.unlocked} /> {t('spendable')}
            </p>
          )}
          <p className="text-xs text-text-secondary">{t('estimatedFee')}</p>
          {error && (
            <div className="space-y-1">
              <p className="text-sm text-danger">{error}</p>
              {transferFailed && (
                <p className="text-sm text-text-secondary">
                  {t('fundsNotSent')}
                </p>
              )}
            </div>
          )}
          <Button
            type="submit"
            disabled={
              balanceLoading ||
              !addressValid ||
              amountPiconero <= 0 ||
              insufficient ||
              pendingTx
            }
          >
            {t('reviewTransaction')}
          </Button>
        </form>

        {confirmOpen && (
          <div className="mt-6 rounded-lg border border-border bg-surface-hover p-4">
            <p className="text-sm text-text-primary">
              Send <XMRAmount piconero={amountPiconero} /> to {address.slice(0, 8)}...{address.slice(-6)}?
            </p>
            <p className="text-sm text-text-secondary">{t('estimatedFee')}</p>
            <div className="mt-3 flex gap-2">
              <Button onClick={handleSend} disabled={sending}>
                {sending ? t('sending') : t('confirmSend')}
              </Button>
              <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={sending}>
                {t('edit')}
              </Button>
              <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={sending}>
                {t('cancel')}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
