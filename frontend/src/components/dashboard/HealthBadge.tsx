import { useRef, useEffect, useState } from 'react'
import { useHealth } from '@/hooks/useHealth'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/hooks/useTranslation'

export function HealthBadge({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { data, isError } = useHealth()

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const ok = data?.services?.walletrpc === true && data?.services?.postgresql === true
  const status = isError || !data
    ? t('healthOffline')
    : !ok
      ? t('healthConnectionIssue')
      : t('healthConnected')
  const whichDown =
    data && !ok
      ? [
          !data.services.walletrpc && t('healthWallet'),
          !data.services.postgresql && t('healthDatabase'),
        ]
          .filter(Boolean)
          .join(', ')
      : null

  const message = ok
    ? t('healthMessageOk')
    : whichDown
      ? t('connectionIssueWith', { services: whichDown })
      : t('healthMessageError')

  const content = (
    <>
      <span
        className={cn(
          'h-2 w-2 shrink-0 rounded-full',
          isError || !data ? 'bg-danger' : ok ? 'bg-success' : 'bg-warning'
        )}
      />
      <span className={cn(ok ? 'text-success' : 'text-danger', compact && 'text-text-secondary')}>
        {status}
      </span>
      {whichDown && !compact && (
        <span className="text-text-secondary">({whichDown})</span>
      )}
    </>
  )

  return (
    <div ref={ref} className="relative inline-block">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          'h-auto gap-2 p-0 font-normal hover:bg-transparent',
          compact ? 'text-xs' : 'text-sm'
        )}
        onClick={() => setOpen((v) => !v)}
        title={t('connectionStatus')}
      >
        {content}
      </Button>
      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-1 min-w-[200px] rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary shadow-lg"
          role="tooltip"
        >
          <p>{message}</p>
        </div>
      )}
    </div>
  )
}
