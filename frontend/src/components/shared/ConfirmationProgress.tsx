import { CONFIRMATIONS_REQUIRED, MIN_PER_CONFIRMATION } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { Check, Radio, Loader2 } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

type Phase = 'detected' | 'confirming' | 'complete'

function getPhase(confirmations: number, locked: boolean): Phase {
  if (confirmations >= CONFIRMATIONS_REQUIRED && !locked) return 'complete'
  if (confirmations > 0) return 'confirming'
  return 'detected'
}

export function ConfirmationProgress({
  confirmations,
  locked,
  className,
}: {
  confirmations: number
  locked: boolean
  className?: string
}) {
  const { t } = useTranslation()
  const phase = getPhase(confirmations, locked)
  const remainingMin = Math.max(0, (CONFIRMATIONS_REQUIRED - confirmations) * MIN_PER_CONFIRMATION)

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border p-4',
        phase === 'detected' && 'border-accent bg-accent/10',
        phase === 'confirming' && 'border-accent/50 bg-accent/5',
        phase === 'complete' && 'border-success bg-success/10',
        className
      )}
    >
      {phase === 'detected' && (
        <>
          <span className="flex h-10 w-10 items-center justify-center">
            <Radio className="h-6 w-6 animate-pulse text-accent" />
          </span>
          <div>
            <p className="font-medium text-accent">{t('paymentDetected')}</p>
            <p className="text-sm text-text-secondary">{t('transactionSeen')}</p>
          </div>
        </>
      )}
      {phase === 'confirming' && (
        <>
          <span className="flex h-10 w-10 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-accent" />
          </span>
          <div>
            <p className="font-medium text-text-primary">
              {t('confirmingProgress')} ({confirmations}/{CONFIRMATIONS_REQUIRED})
            </p>
            <p className="text-sm text-text-secondary">
              {t('confirmationsOf', { current: confirmations, required: CONFIRMATIONS_REQUIRED, min: remainingMin })}
            </p>
          </div>
        </>
      )}
      {phase === 'complete' && (
        <>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-success/20">
            <Check className="h-5 w-5 text-success" />
          </span>
          <div>
            <p className="font-medium text-success">{t('paymentComplete')}</p>
            <p className="text-sm text-text-secondary">{t('fullyConfirmed')}</p>
          </div>
        </>
      )}
    </div>
  )
}
