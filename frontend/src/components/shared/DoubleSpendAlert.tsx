import { shortHash } from '@/lib/utils'
import { AlertTriangle } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

export function DoubleSpendAlert({ txHash }: { txHash: string }) {
  const { t } = useTranslation()
  return (
    <div className="flex w-full items-center gap-3 bg-danger/20 px-4 py-3 text-danger border-b border-danger/40">
      <AlertTriangle className="h-5 w-5 shrink-0" />
      <p className="text-sm font-medium">
        {t('doubleSpendAlert', { hash: shortHash(txHash) })}
      </p>
    </div>
  )
}
