import { useQueries } from '@tanstack/react-query'
import { useRecentPayments } from '@/context/RecentPaymentsContext'
import { moneropayApi } from '@/api/moneropay'
import { RecentPayments, type RecentPaymentItem } from './RecentPayments'

export function RecentPaymentsWithData() {
  const { items } = useRecentPayments()
  const queries = useQueries({
    queries: items.map((item) => ({
      queryKey: ['receive', item.address],
      queryFn: () => moneropayApi.getReceive(item.address),
      refetchInterval: 15_000,
    })),
  })
  const payments: RecentPaymentItem[] = items.map((item, i) => {
    const res = queries[i]?.data
    return {
      address: item.address,
      amount: item.amount,
      description: item.description,
      complete: res?.complete ?? false,
      transactions: res?.transactions ?? [],
    }
  })
  return <RecentPayments payments={payments} />
}
