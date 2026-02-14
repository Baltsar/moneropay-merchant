import { useQueries } from '@tanstack/react-query'
import { useRecentPayments } from '@/context/RecentPaymentsContext'
import { moneropayApi } from '@/api/moneropay'
import { BalanceCard } from '@/components/dashboard/BalanceCard'
import { RecentPaymentsWithData } from '@/components/dashboard/RecentPaymentsWithData'
import { VolumeChart } from '@/components/dashboard/VolumeChart'
import { DoubleSpendAlert } from '@/components/shared/DoubleSpendAlert'

export function Dashboard() {
  const { items } = useRecentPayments()
  const queries = useQueries({
    queries: items.map((item) => ({
      queryKey: ['receive', item.address],
      queryFn: () => moneropayApi.getReceive(item.address),
    })),
  })
  const hasDoubleSpend = queries.some(
    (q) => q.data?.transactions?.some((tx) => tx.double_spend_seen)
  )
  const doubleSpendTx = queries
    .flatMap((q) => q.data?.transactions ?? [])
    .find((tx) => tx.double_spend_seen)

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-text-primary">Dashboard</h1>
      {hasDoubleSpend && doubleSpendTx && (
        <DoubleSpendAlert txHash={doubleSpendTx.tx_hash} />
      )}
      <BalanceCard />
      <div className="grid gap-6 md:grid-cols-2">
        <RecentPaymentsWithData />
        <VolumeChart />
      </div>
    </div>
  )
}
