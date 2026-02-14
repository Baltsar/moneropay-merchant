import { useState, useRef, useEffect } from 'react'
import { HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CONFIRMATIONS_REQUIRED } from '@/lib/constants'

export type PaymentStatusType = 'complete' | 'confirming' | 'double_spend' | 'waiting'

const HELP_TEXT: Record<PaymentStatusType, string> = {
  waiting:
    'No transaction has been detected yet. The customer may not have sent the payment, or it\'s still propagating on the network. Ask them to check their wallet or wait a minute.',
  confirming: `The payment has been seen on the network and is being confirmed. Monero requires ${CONFIRMATIONS_REQUIRED} confirmations (~20 minutes) before the funds are spendable. This is normal and secure.`,
  complete:
    'The payment has reached 10 confirmations and the funds are available in your wallet.',
  double_spend:
    'A double-spend attempt was detected for this transaction. Do not release goods until it reaches 10/10 confirmations, or the transaction may be reversed.',
}

export function StatusHelpIcon({
  status,
  className,
}: {
  status: PaymentStatusType
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

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
        aria-label="What does this status mean?"
      >
        <HelpCircle className="h-4 w-4" />
      </button>
      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-1 w-72 rounded-lg border border-border bg-surface p-3 text-left text-sm text-text-primary shadow-lg"
          role="tooltip"
        >
          <p className="text-text-secondary font-medium uppercase tracking-wide">
            {status === 'complete' && 'Complete'}
            {status === 'confirming' && 'Confirming'}
            {status === 'double_spend' && 'Double Spend'}
            {status === 'waiting' && 'Waiting'}
          </p>
          <p className="mt-1 leading-relaxed">{HELP_TEXT[status]}</p>
        </div>
      )}
    </div>
  )
}
