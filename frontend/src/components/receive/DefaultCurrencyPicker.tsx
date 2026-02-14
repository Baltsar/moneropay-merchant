import { useState } from 'react'
import { useFiatCurrency } from '@/context/FiatCurrencyContext'
import { FIAT_CURRENCIES } from '@/lib/constants'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useXMRPrice } from '@/hooks/useXMRPrice'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export function DefaultCurrencyPicker() {
  const [open, setOpen] = useState(false)
  const { fiatCurrency, setFiatCurrency } = useFiatCurrency()
  const { data: priceMap } = useXMRPrice()

  const handleSelect = (code: string) => {
    setFiatCurrency(code)
    setOpen(false)
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3">
      <div>
        <p className="text-xs uppercase tracking-wide text-text-secondary">
          Default currency
        </p>
        <p className="font-medium text-text-primary">
          {FIAT_CURRENCIES.find((c) => c.code === fiatCurrency)?.name ?? fiatCurrency}{' '}
          <span className="text-text-secondary font-normal">
            ({FIAT_CURRENCIES.find((c) => c.code === fiatCurrency)?.symbol ?? fiatCurrency})
          </span>
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Change
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          title="Choose default currency"
          onClose={() => setOpen(false)}
          className="sm:max-w-md"
        >
          <p className="text-sm text-text-secondary -mt-2">
            Used for amounts and conversion on the Receive screen. Rate from CoinGecko.
          </p>
          <div className="grid grid-cols-2 gap-2 pt-2">
            {FIAT_CURRENCIES.map((c) => {
              const rate = priceMap?.[c.code.toLowerCase()]
              const isSelected = fiatCurrency === c.code
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => handleSelect(c.code)}
                  className={cn(
                    'flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors',
                    isSelected
                      ? 'border-accent bg-accent/10 text-text-primary'
                      : 'border-border bg-surface-hover text-text-primary hover:border-border hover:bg-surface'
                  )}
                >
                  <span>
                    <span className="font-medium">{c.code}</span>
                    <span className="ml-1 text-text-secondary text-sm">{c.name}</span>
                    {rate != null && (
                      <span className="block text-xs text-text-secondary mt-0.5">
                        1 XMR ≈ {c.symbol}{rate.toFixed(2)}
                      </span>
                    )}
                  </span>
                  {isSelected && <Check className="h-5 w-5 text-accent shrink-0" />}
                </button>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
