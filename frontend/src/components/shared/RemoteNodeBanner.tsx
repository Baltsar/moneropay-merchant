import { useState, useEffect } from 'react'
import { NODE_MODE } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { AlertTriangle, X } from 'lucide-react'

const DISMISS_KEY = 'moneropay_remote_banner_dismissed'

export function RemoteNodeBanner() {
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    try {
      setDismissed(sessionStorage.getItem(DISMISS_KEY) === 'true')
    } catch {
      setDismissed(false)
    }
  }, [])

  const dismiss = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, 'true')
      setDismissed(true)
    } catch {
      setDismissed(true)
    }
  }

  if (NODE_MODE !== 'remote' || dismissed) return null

  return (
    <div className="flex w-full items-center justify-between gap-3 border-b border-warning/40 bg-warning/10 px-4 py-2 text-warning">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <span className="text-sm">
          Connected to external node — your privacy is reduced. Run your own node for full privacy.
        </span>
        <a
          href="https://www.getmonero.org/resources/user-guides/run-a-node.html"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm underline hover:no-underline"
        >
          Learn More
        </a>
      </div>
      <Button variant="ghost" size="icon" onClick={dismiss} className="shrink-0 text-warning hover:bg-warning/20">
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
