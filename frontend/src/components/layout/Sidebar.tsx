import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, ArrowDownToLine, ArrowUpFromLine, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FIAT_CURRENCIES } from '@/lib/constants'
import { HealthBadge } from '@/components/dashboard/HealthBadge'

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/receive', label: 'Receive', icon: ArrowDownToLine },
  { to: '/send', label: 'Send', icon: ArrowUpFromLine },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar({
  fiatCurrency,
  onFiatChange,
}: {
  fiatCurrency: string
  onFiatChange?: (c: string) => void
}) {
  const location = useLocation()

  return (
    <aside className="flex w-56 flex-col border-r border-border bg-surface">
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <span className="font-semibold text-text-primary">MoneroPay</span>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {nav.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              location.pathname === to || (to !== '/' && location.pathname.startsWith(to))
                ? 'bg-accent/20 text-accent'
                : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-border p-2 space-y-2">
        {onFiatChange && (
          <select
            value={fiatCurrency}
            onChange={(e) => onFiatChange(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-primary"
          >
            {FIAT_CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} ({c.symbol})
              </option>
            ))}
          </select>
        )}
        <HealthBadge compact />
      </div>
    </aside>
  )
}
