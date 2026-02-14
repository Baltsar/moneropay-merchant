import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, ArrowDownToLine, ArrowUpFromLine, Settings, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FIAT_CURRENCIES } from '@/lib/constants'
import { HealthBadge } from '@/components/dashboard/HealthBadge'
import { useTranslation } from '@/hooks/useTranslation'
import { useLocale } from '@/context/LocaleContext'
import type { Locale } from '@/lib/translations'

const nav = [
  { to: '/', labelKey: 'navDashboard' as const, icon: LayoutDashboard },
  { to: '/receive', labelKey: 'navReceive' as const, icon: ArrowDownToLine },
  { to: '/send', labelKey: 'navSend' as const, icon: ArrowUpFromLine },
  { to: '/settings', labelKey: 'navSettings' as const, icon: Settings },
]

function SidebarContent({
  fiatCurrency,
  onFiatChange,
  onNavClick,
}: {
  fiatCurrency: string
  onFiatChange?: (c: string) => void
  onNavClick?: () => void
}) {
  const location = useLocation()
  const { t } = useTranslation()
  const { locale, setLocale } = useLocale()

  return (
    <>
      <nav className="flex-1 space-y-1 overflow-auto p-2">
        {nav.map(({ to, labelKey, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            onClick={onNavClick}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              location.pathname === to || (to !== '/' && location.pathname.startsWith(to))
                ? 'bg-accent/20 text-accent'
                : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {t(labelKey)}
          </Link>
        ))}
      </nav>
      <div className="border-t border-border p-2 space-y-2 shrink-0">
        <select
          value={locale}
          onChange={(e) => setLocale(e.target.value as Locale)}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-primary"
          aria-label={t('language')}
        >
          <option value="en">{t('languageEnglish')}</option>
          <option value="es">{t('languageSpanish')}</option>
        </select>
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
    </>
  )
}

export function Sidebar({
  fiatCurrency,
  onFiatChange,
  mobileOpen,
  onMobileClose,
}: {
  fiatCurrency: string
  onFiatChange?: (c: string) => void
  mobileOpen?: boolean
  onMobileClose?: () => void
}) {
  return (
    <>
      {/* Desktop: fixed sidebar */}
      <aside className="hidden md:flex w-56 flex-col border-r border-border bg-surface shrink-0">
        <div className="flex h-14 items-center gap-2 border-b border-border px-4 shrink-0">
          <span className="font-semibold text-text-primary">MoneroPay</span>
        </div>
        <SidebarContent fiatCurrency={fiatCurrency} onFiatChange={onFiatChange} />
      </aside>

      {/* Mobile: overlay drawer */}
      {mobileOpen && onMobileClose && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            onClick={onMobileClose}
            aria-hidden
          />
          <aside
            className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-border bg-surface shadow-xl md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            <div className="flex h-14 items-center justify-between border-b border-border px-4">
              <span className="font-semibold text-text-primary">MoneroPay</span>
              <button
                type="button"
                onClick={onMobileClose}
                className="rounded p-2 text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-1 flex-col min-h-0">
              <SidebarContent
                fiatCurrency={fiatCurrency}
                onFiatChange={onFiatChange}
                onNavClick={onMobileClose}
              />
            </div>
          </aside>
        </>
      )}
    </>
  )
}
