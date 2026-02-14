import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { RemoteNodeBanner } from '@/components/shared/RemoteNodeBanner'
import { useFiatCurrency } from '@/context/FiatCurrencyContext'

export function Layout() {
  const { fiatCurrency, setFiatCurrency } = useFiatCurrency()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <RemoteNodeBanner />
      <div className="flex min-h-0 flex-1">
        <Sidebar fiatCurrency={fiatCurrency} onFiatChange={setFiatCurrency} />
        <div className="flex flex-1 flex-col min-w-0">
          <TopBar />
          <main className="flex-1 overflow-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
