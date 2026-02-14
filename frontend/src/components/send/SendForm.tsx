import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useBalance } from '@/hooks/useBalance'
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
  const [amountXMR, setAmountXMR] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ txHash: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { data: balance } = useBalance()
  const amountPiconero = xmrToPiconero(parseFloat(amountXMR) || 0)
  const unlocked = balance?.unlocked ?? 0
  const locked = balance?.locked ?? 0
  const insufficient = amountPiconero > 0 && amountPiconero > unlocked
  const lockedMin = locked > 0 ? Math.ceil((CONFIRMATIONS_REQUIRED * MIN_PER_CONFIRMATION) / 2) : 0
  const addressValid = address.trim() === '' || validateAddress(address.trim())

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
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
      setAmountXMR('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transfer failed')
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
            <label className="text-sm text-text-secondary">Amount (XMR)</label>
            <Input
              type="number"
              step="0.0001"
              min="0"
              placeholder="0.3500"
              value={amountXMR}
              onChange={(e) => setAmountXMR(e.target.value)}
            />
            {amountPiconero > 0 && <FiatAmount piconero={amountPiconero} className="block mt-1" />}
          </div>
          {balance && (
            <p className="text-sm text-text-secondary">
              Available: <XMRAmount piconero={balance.unlocked} /> (spendable)
            </p>
          )}
          <p className="text-xs text-text-secondary">Estimated fee: ~0.0001 XMR</p>
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" disabled={!addressValid || amountPiconero <= 0 || insufficient}>
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
