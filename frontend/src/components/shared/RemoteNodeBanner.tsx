import { useState, useEffect } from 'react'
import { NODE_MODE } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Info, X } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

const DISMISS_KEY = 'moneropay_remote_banner_dismissed'

export function RemoteNodeBanner() {
  const { t } = useTranslation()
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
    <div className="flex w-full items-center justify-between gap-3 border-b border-border bg-surface-hover px-4 py-2 text-text-secondary">
      <div className="flex items-center gap-2">
        <Info className="h-4 w-4 shrink-0 text-text-secondary" />
        <span className="text-sm">
          {t('remoteBannerText')}
        </span>
        <a
          href="https://www.getmonero.org/resources/user-guides/run-a-node.html"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-accent underline hover:no-underline"
        >
          {t('learnMore')}
        </a>
      </div>
      <Button variant="ghost" size="icon" onClick={dismiss} className="shrink-0 text-text-secondary hover:bg-surface hover:text-text-primary">
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
