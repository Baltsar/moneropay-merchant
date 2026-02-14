import type { HealthResponse } from '@/api/moneropay'
import type { GetInfoResult } from '@/api/node'
import { calcSyncProgress } from '@/hooks/useSyncStatus'
import { Check, CircleAlert, Loader2 } from 'lucide-react'
import { NODE_MODE } from '@/lib/constants'

function StatusRow({
  label,
  ok,
  loading,
  detail,
}: {
  label: string
  ok: boolean
  loading?: boolean
  detail?: string
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      {ok ? (
        <Check className="h-5 w-5 text-success shrink-0" />
      ) : loading ? (
        <Loader2 className="h-5 w-5 animate-spin text-warning shrink-0" />
      ) : (
        <CircleAlert className="h-5 w-5 text-danger shrink-0" />
      )}
      <span className="text-text-primary">{label}</span>
      {detail && <span className="ml-auto text-text-secondary text-sm">{detail}</span>}
    </div>
  )
}

export function SetupChecklist({
  health,
  syncStatus,
}: {
  health: HealthResponse | undefined
  syncStatus: GetInfoResult | undefined
}) {
  const dbUp = health?.services?.postgresql === true
  const walletUp = health?.services?.walletrpc === true
  const moneropayUp = health?.status === 200
  const nodeSynced = NODE_MODE === 'remote' || syncStatus?.synchronized === true
  const nodeProgress =
    syncStatus && !syncStatus.synchronized && syncStatus.target_height
      ? calcSyncProgress(syncStatus.height, syncStatus.target_height).toFixed(1)
      : null

  return (
    <div className="space-y-1 rounded-lg border border-border bg-surface p-4">
      <StatusRow label="Database" ok={dbUp} loading={health === undefined} />
      <StatusRow label="Wallet Service" ok={walletUp} loading={health !== undefined && !walletUp && dbUp} />
      <StatusRow label="MoneroPay" ok={moneropayUp} loading={walletUp && !moneropayUp} />
      {NODE_MODE === 'local' && (
        <StatusRow
          label="Monero Node"
          ok={nodeSynced}
          loading={!!syncStatus && !syncStatus.synchronized}
          detail={nodeProgress != null ? `Syncing (${nodeProgress}%)` : undefined}
        />
      )}
    </div>
  )
}
