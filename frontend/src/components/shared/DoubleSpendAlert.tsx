import { shortHash } from '@/lib/utils'
import { AlertTriangle } from 'lucide-react'

export function DoubleSpendAlert({ txHash }: { txHash: string }) {
  return (
    <div className="flex w-full items-center gap-3 bg-danger/20 px-4 py-3 text-danger border-b border-danger/40">
      <AlertTriangle className="h-5 w-5 shrink-0" />
      <p className="text-sm font-medium">
        DOUBLE SPEND DETECTED — Transaction {shortHash(txHash)} may be fraudulent. Do NOT release
        goods until fully confirmed (10/10 confirmations).
      </p>
    </div>
  )
}
