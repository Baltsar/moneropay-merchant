import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHealth } from '@/hooks/useHealth'
import { useSyncStatus } from '@/hooks/useSyncStatus'
import { NODE_MODE } from '@/lib/constants'
import type { HealthResponse } from '@/api/moneropay'
import type { GetInfoResult } from '@/api/node'
import { SetupChecklist } from '@/components/onboarding/SetupChecklist'
import { SyncProgress } from '@/components/onboarding/SyncProgress'
import { WalletBackup } from '@/components/onboarding/WalletBackup'
import { CircleAlert } from 'lucide-react'

const BACKUP_ACK_KEY = 'moneropay_backup_acknowledged'

export function Onboarding() {
  const navigate = useNavigate()
  const { data: health, isError: healthError } = useHealth()
  const { data: syncStatus, eta, blocksPerSec } = useSyncStatus()
  const [showBackup, setShowBackup] = useState(false)
  const [readyDone, setReadyDone] = useState(false)

  const isMoneroPayReachable = !healthError && health !== undefined
  const isWalletRpcUp = health?.services?.walletrpc === true
  const isDbUp = health?.services?.postgresql === true
  const sync = syncStatus as GetInfoResult | undefined
  const isNodeSynced = NODE_MODE === 'remote' || sync?.synchronized === true
  const isSystemReady = isMoneroPayReachable && isWalletRpcUp && isDbUp && isNodeSynced
  const showSync = NODE_MODE === 'local' && isMoneroPayReachable && isWalletRpcUp && isDbUp && !sync?.synchronized
  const justSynced =
    NODE_MODE === 'local' &&
    sync?.synchronized === true &&
    isSystemReady

  useEffect(() => {
    if (!justSynced) return
    const ack = localStorage.getItem(BACKUP_ACK_KEY)
    if (ack === 'true') {
      setReadyDone(true)
      const t = setTimeout(() => navigate('/', { replace: true }), 1000)
      return () => clearTimeout(t)
    }
    setShowBackup(true)
  }, [justSynced, navigate])

  const handleBackupAck = () => {
    setShowBackup(false)
    setReadyDone(true)
    const t = setTimeout(() => navigate('/', { replace: true }), 800)
    return () => clearTimeout(t)
  }

  if (readyDone) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
        <div className="text-center text-success">
          <p className="text-2xl font-semibold">Ready!</p>
        </div>
      </div>
    )
  }

  if (showBackup) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
        <WalletBackup onAck={handleBackupAck} />
      </div>
    )
  }

  if (!isMoneroPayReachable) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
        <div className="max-w-md space-y-4 text-center">
          <CircleAlert className="mx-auto h-12 w-12 text-warning" />
          <h2 className="text-xl font-semibold text-text-primary">Cannot reach MoneroPay</h2>
          <p className="text-text-secondary">
            Make sure all services are running:
          </p>
          <code className="block rounded bg-surface px-4 py-2 font-mono text-sm text-text-primary">
            docker compose up -d
          </code>
          <p className="text-sm text-text-secondary">Checking again in 10 seconds...</p>
          <p className="text-sm text-text-secondary">
            If this persists, check that the server is running and the URL is correct.
          </p>
        </div>
      </div>
    )
  }

  if (showSync) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
        <div className="w-full max-w-lg space-y-8">
          <SyncProgress data={sync} eta={eta ?? undefined} blocksPerSec={blocksPerSec} />
          <SetupChecklist health={health as HealthResponse | undefined} syncStatus={sync} />
        </div>
      </div>
    )
  }

  if (!isSystemReady) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
        <div className="w-full max-w-md space-y-6">
          <h2 className="text-center text-xl font-semibold text-text-primary">
            Setting up your payment system
          </h2>
          <SetupChecklist health={health as HealthResponse | undefined} syncStatus={sync} />
          <p className="text-center text-sm text-text-secondary">
            This usually takes 1-2 minutes.
          </p>
        </div>
      </div>
    )
  }

  return null
}
