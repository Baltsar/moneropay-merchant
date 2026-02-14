import { BalanceCard } from '@/components/dashboard/BalanceCard'
import { RecentPaymentsWithData } from '@/components/dashboard/RecentPaymentsWithData'
import { VolumeChart } from '@/components/dashboard/VolumeChart'

export function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-text-primary">Dashboard</h1>
      <BalanceCard />
      <div className="grid gap-6 md:grid-cols-2">
        <RecentPaymentsWithData />
        <VolumeChart />
      </div>
    </div>
  )
}
