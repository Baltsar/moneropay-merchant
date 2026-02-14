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

function validateAddress(addr: string): boolean {
  if (addr.length < 90 || addr.length > 100) return false
  return addr.startsWith('4') || addr.startsWith('8')
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

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setTransferFailed(false)
    if (!addressValid || address.trim().length < 90) {
      setError('Invalid Monero address')
      return
    }
    if (amountPiconero <= 0) {
      setError('Enter a valid amount')
      return
    }
    if (insufficient) {
      setError(
        `Insufficient spendable balance. You have ${(unlocked / 1e12).toFixed(4)} XMR unlocked but ${(locked / 1e12).toFixed(4)} XMR is still confirming (~${lockedMin} min).`
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
      setResult({ txHash: res.tx_hash })
      setConfirmOpen(false)
      setAddress('')
      setAmountInput('')
    } catch (err) {
      setTransferFailed(true)
      setError(err instanceof Error ? err.message : 'Transfer failed')
      setConfirmOpen(false)
    } finally {
      setSending(false)
    }
  }

  if (result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium text-success">Sent</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-mono text-sm text-text-primary break-all">{result.txHash}</p>
          <Button
            className="mt-2"
            variant="outline"
            size="sm"
            onClick={() => navigator.clipboard.writeText(result.txHash)}
          >
            Copy tx_hash
          </Button>
          <Button className="mt-2 ml-2" variant="secondary" onClick={() => setResult(null)}>
            Send again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium text-text-secondary">Send XMR</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleReview} className="space-y-4">
          <div>
            <label className="text-sm text-text-secondary">Recipient Address</label>
            <Input
              className="mt-1 font-mono text-sm"
              placeholder="4 or 8..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            {address.length > 0 && !addressValid && (
              <p className="mt-1 text-sm text-danger">Invalid Monero address</p>
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
              Amount {isXMR ? '(XMR)' : `(${fiatCurrency})`}
            </label>
            <Input
              type="number"
              step={isXMR ? '0.0001' : '0.01'}
              min="0"
              placeholder={isXMR ? '0.3500' : '50.00'}
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
            />
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
            <p className="text-sm text-text-secondary">Loading balance…</p>
          )}
          {balance && (
            <p className="text-sm text-text-secondary">
              Available: <XMRAmount piconero={balance.unlocked} /> (spendable)
            </p>
          )}
          <p className="text-xs text-text-secondary">Estimated fee: ~0.0001 XMR</p>
          {error && (
            <div className="space-y-1">
              <p className="text-sm text-danger">{error}</p>
              {transferFailed && (
                <p className="text-sm text-text-secondary">
                  Your funds were not sent. You can try again.
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
              insufficient
            }
          >
            Review Transaction
          </Button>
        </form>

        {confirmOpen && (
          <div className="mt-6 rounded-lg border border-border bg-surface-hover p-4">
            <p className="text-sm text-text-primary">
              Send <XMRAmount piconero={amountPiconero} /> to {address.slice(0, 8)}...{address.slice(-6)}?
            </p>
            <p className="text-sm text-text-secondary">Estimated fee: ~0.0001 XMR</p>
            <div className="mt-3 flex gap-2">
              <Button onClick={handleSend} disabled={sending}>
                {sending ? 'Sending...' : 'Confirm Send'}
              </Button>
              <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={sending}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
