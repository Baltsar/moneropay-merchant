import { useState, useRef, useEffect } from 'react'
import { HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/hooks/useTranslation'

export type PaymentStatusType = 'complete' | 'confirming' | 'double_spend' | 'waiting'

export function StatusHelpIcon({
  status,
  className,
}: {
  status: PaymentStatusType
  className?: string
}) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const helpText: Record<PaymentStatusType, string> = {
    waiting: t('statusHelpWaiting'),
    confirming: t('statusHelpConfirming'),
    complete: t('statusHelpComplete'),
    double_spend: t('statusHelpDoubleSpend'),
  }

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  return (
    <div ref={ref} className={cn('relative inline-flex', className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex rounded p-0.5 text-text-secondary hover:text-text-primary hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 focus:ring-offset-background"
        aria-label={t('whatDoesStatusMean')}
      >
        <HelpCircle className="h-4 w-4" />
      </button>
      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-1 w-72 rounded-lg border border-border bg-surface p-3 text-left text-sm text-text-primary shadow-lg"
          role="tooltip"
        >
          <p className="text-text-secondary font-medium uppercase tracking-wide">
            {status === 'complete' && t('statusComplete')}
            {status === 'confirming' && t('statusConfirming')}
            {status === 'double_spend' && t('statusDoubleSpend')}
            {status === 'waiting' && t('statusWaiting')}
          </p>
          <p className="mt-1 leading-relaxed">{helpText[status]}</p>
        </div>
      )}
    </div>
  )
}
