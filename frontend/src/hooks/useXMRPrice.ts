import { useQuery } from '@tanstack/react-query'
import { POLL_INTERVALS, FIAT_CURRENCY, USE_MOCK } from '@/lib/constants'
import { fetchPrice } from '@/api/mock'

const COINGECKO_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=monero&vs_currencies=usd,eur,gbp,mxn'

async function getPrice(): Promise<Record<string, number>> {
  if (USE_MOCK) {
    const p = await fetchPrice()
    return { usd: p.usd ?? 0, eur: p.eur ?? 0, gbp: p.gbp ?? 0, mxn: p.mxn ?? 0 }
  }
  const r = await fetch(COINGECKO_URL)
  if (!r.ok) throw new Error('Price fetch failed')
  const data = await r.json()
  return (data.monero ?? {}) as Record<string, number>
}

export function useXMRPrice() {
  return useQuery({
    queryKey: ['xmrPrice'],
    queryFn: getPrice,
    refetchInterval: POLL_INTERVALS.price,
    retry: 1,
  })
}

export function useFiatAmount(piconero: number, currency?: string): string | null {
  const { data: priceMap } = useXMRPrice()
  if (!priceMap) return null
  const cur = (currency ?? FIAT_CURRENCY).toLowerCase()
  const rate = priceMap[cur] ?? priceMap.usd
  if (rate == null) return null
  const xmr = piconero / 1e12
  const symbol = cur === 'usd' ? '$' : cur === 'eur' ? '€' : cur === 'gbp' ? '£' : '$'
  return `~${symbol}${(xmr * rate).toFixed(2)}`
}
