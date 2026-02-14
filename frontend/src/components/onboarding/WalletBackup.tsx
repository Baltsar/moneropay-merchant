import { Button } from '@/components/ui/button'
import { Check, AlertTriangle } from 'lucide-react'

const BACKUP_ACK_KEY = 'moneropay_backup_acknowledged'

export function WalletBackup({ onAck }: { onAck: () => void }) {
  const handleAck = () => {
    try {
      localStorage.setItem(BACKUP_ACK_KEY, 'true')
    } catch {
      // ignore
    }
    onAck()
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 text-center">
      <div className="flex items-center justify-center gap-2 text-success">
        <Check className="h-8 w-8" />
        <h2 className="text-2xl font-semibold">System Ready</h2>
      </div>
      <div className="rounded-lg border border-warning/50 bg-warning/10 p-6 text-left">
        <div className="flex gap-3">
          <AlertTriangle className="h-6 w-6 shrink-0 text-warning" />
          <div className="space-y-3">
            <h3 className="font-semibold text-warning">IMPORTANT: Back up your wallet</h3>
            <p className="text-sm text-text-secondary">
              Your wallet files are stored in the Docker volume &quot;wallet-data&quot;. If this
              volume is deleted, your funds are PERMANENTLY LOST.
            </p>
            <p className="text-sm text-text-primary">
              To back up, run:
              <code className="mt-2 block rounded bg-background px-2 py-2 font-mono text-xs">
                docker cp $(docker compose ps -q wallet-rpc):/wallet ./wallet-backup/
              </code>
            </p>
            <p className="text-sm text-text-secondary">
              Store the backup securely offline.
            </p>
          </div>
        </div>
      </div>
      <Button size="lg" onClick={handleAck}>
        I&apos;ve backed up my wallet — Enter Dashboard
      </Button>
    </div>
  )
}
