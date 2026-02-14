import { NODE_MODE } from '@/lib/constants'
import { useHealth } from '@/hooks/useHealth'
import { AlertTriangle } from 'lucide-react'

export function RemoteNodeUnreachableBanner() {
  const { data: health, isError } = useHealth()

  if (NODE_MODE !== 'remote') return null
  if (!isError && (!health || health.services?.walletrpc)) return null

  return (
    <div className="flex w-full items-center gap-3 border-b border-danger/40 bg-danger/10 px-4 py-2 text-danger">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <span className="text-sm font-medium">
        Remote node unreachable. Check REMOTE_NODE_HOST and REMOTE_NODE_PORT in .env and that the node is running.
      </span>
    </div>
  )
}
