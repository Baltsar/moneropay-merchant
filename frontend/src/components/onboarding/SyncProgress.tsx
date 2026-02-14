import { Progress } from '@/components/ui/progress'
import { calcSyncProgress } from '@/hooks/useSyncStatus'
import type { GetInfoResult } from '@/api/node'
import { useTranslation } from '@/hooks/useTranslation'

export function SyncProgress({
  data,
  eta,
  blocksPerSec,
}: {
  data: GetInfoResult | undefined
  eta?: string | null
  blocksPerSec?: number
}) {
  const { t } = useTranslation()
  if (!data) return null

  const targetHeight = data.target_height || data.height || 1
  const progress = calcSyncProgress(data.height, targetHeight)
  const isConnecting = targetHeight === 0 && !data.synchronized && data.height === 0

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-warning">{t('syncingBlockchain')}</h2>
      {isConnecting ? (
        <p className="text-text-secondary">{t('connectingToNetwork')}</p>
      ) : (
        <>
          <p className="font-mono text-lg text-text-primary">
            Block {data.height.toLocaleString()} / {targetHeight.toLocaleString()}
            <span className="ml-2 text-text-secondary">({progress.toFixed(1)}%)</span>
          </p>
          <Progress value={progress} className="h-3" />
          {eta && <p className="text-sm text-text-secondary">{eta}</p>}
          {blocksPerSec != null && blocksPerSec > 0 && (
            <p className="text-sm text-text-secondary">{t('syncSpeed', { n: Math.round(blocksPerSec) })}</p>
          )}
          <p className="text-sm text-text-secondary">
            {t('syncHint')}
          </p>
        </>
      )}
    </div>
  )
}
