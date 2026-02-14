import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { xmrToPiconero } from '@/lib/utils'
import { useXMRPrice } from '@/hooks/useXMRPrice'
import { useFiatCurrency } from '@/context/FiatCurrencyContext'

export function CreatePayment({
  onCreated,
}: {
  onCreated: (params: { address: string; amount: number; description?: string }) => void
}) {
  const [amountInput, setAmountInput] = useState('')
  const [isXMR, setIsXMR] = useState(false)
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { fiatCurrency } = useFiatCurrency()
  const { data: priceMap } = useXMRPrice()
  const rate = priceMap?.[fiatCurrency.toLowerCase()] ?? priceMap?.usd ?? 0

  const amountXMR = (() => {
    const n = parseFloat(amountInput)
    if (Number.isNaN(n) || n < 0) return 0
    if (isXMR) return n
    return rate > 0 ? n / rate : 0
  })()
  const amountFiat = amountXMR * (rate || 0)
  const amountPiconero = xmrToPiconero(amountXMR)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (amountPiconero <= 0) {
      setError('Enter a valid amount')
      return
    }
    setLoading(true)
    try {
      const { moneropayApi } = await import('@/api/moneropay')
      const res = await moneropayApi.postReceive({
        amount: amountPiconero,
        description: description || undefined,
      })
      onCreated({
        address: res.address,
        amount: amountPiconero,
        description: description || undefined,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create payment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium text-text-secondary">
          Request Payment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
                ? `= ${amountFiat > 0 ? `~${amountFiat.toFixed(2)} ${fiatCurrency}` : '—'}`
                : `= ${amountXMR > 0 ? amountXMR.toFixed(4) : '—'} XMR`}
            </p>
          </div>
          <div>
            <label className="text-sm text-text-secondary">Description (optional)</label>
            <Input
              className="mt-1"
              placeholder="Order #1042"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" disabled={loading || amountPiconero <= 0}>
            {loading ? 'Creating...' : 'Create Payment Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
