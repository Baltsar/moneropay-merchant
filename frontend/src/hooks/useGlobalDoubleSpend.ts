import { useQueries } from '@tanstack/react-query'
import { useRecentPayments } from '@/context/RecentPaymentsContext'
import { moneropayApi } from '@/api/moneropay'

/**
 * Returns the first transaction hash with double_spend_seen across all recent payments.
 * Used to show a non-dismissable banner at the top of the app.
 */
export function useGlobalDoubleSpend(): string | null {
  const { items } = useRecentPayments()
  const queries = useQueries({
    queries: items.map((item) => ({
      queryKey: ['receive', item.address],
      queryFn: () => moneropayApi.getReceive(item.address),
      refetchInterval: 5_000,
    })),
  })
  const tx = queries
    .flatMap((q) => q.data?.transactions ?? [])
    .find((t) => t.double_spend_seen)
  return tx?.tx_hash ?? null
}
