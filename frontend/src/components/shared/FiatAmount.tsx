import { useFiatAmount } from '@/hooks/useXMRPrice'
import { useFiatCurrency } from '@/context/FiatCurrencyContext'
import { Tooltip } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export function FiatAmount({
  piconero,
  className,
  currency: currencyProp,
}: {
  piconero: number
  className?: string
  currency?: string
}) {
  const { fiatCurrency } = useFiatCurrency()
  const currency = currencyProp ?? fiatCurrency
  const amount = useFiatAmount(piconero, currency)
  if (amount == null) return null
  return (
    <Tooltip content="Rate at time of request. Actual rate may vary.">
      <span className={cn('text-text-secondary text-sm', className)}>{amount}</span>
    </Tooltip>
  )
}
