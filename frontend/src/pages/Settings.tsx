import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DefaultCurrencyPicker } from '@/components/receive/DefaultCurrencyPicker'
import { NODE_MODE } from '@/lib/constants'
import { ChevronDown, Coins, ExternalLink, Info, Server, Wallet, Zap } from 'lucide-react'

export function Settings() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold text-text-primary">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium text-text-secondary flex items-center gap-2">
            <Coins className="h-4 w-4" />
            Default currency
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DefaultCurrencyPicker />
          <p className="mt-2 text-xs text-text-secondary">
            The currency you show prices in when receiving or sending. You can change this anytime.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium text-text-secondary flex items-center gap-2">
            <Server className="h-4 w-4" />
            Node & backend
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-text-primary">
            Your payment system is running in <span className="font-medium text-text-primary">{NODE_MODE === 'remote' ? 'remote node' : 'local node'}</span> mode. This was set when the system was installed.
          </p>
          <div className="rounded-lg border border-border bg-surface-hover/50 p-3 text-sm text-text-secondary">
            <p className="flex items-center gap-2 text-text-primary">
              <Info className="h-4 w-4 shrink-0 text-accent" />
              You can’t change this from the dashboard. If someone else set up the server for you, they chose the mode.
            </p>
          </div>
          <details className="group rounded-lg border border-border bg-background">
            <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary [&::-webkit-details-marker]:hidden">
              <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden />
              For server admins: how to change node mode
            </summary>
            <div className="border-t border-border px-3 py-2 text-xs text-text-secondary space-y-2">
              <p>
                Edit <code className="rounded bg-surface-hover px-1 py-0.5 font-mono">.env</code> (<code className="rounded bg-surface-hover px-1 py-0.5 font-mono">NODE_MODE</code>, <code className="rounded bg-surface-hover px-1 py-0.5 font-mono">REMOTE_NODE_HOST</code>, <code className="rounded bg-surface-hover px-1 py-0.5 font-mono">REMOTE_NODE_PORT</code>) and restart: <code className="rounded bg-surface-hover px-1 py-0.5 font-mono">docker compose up -d</code>. See <a href="https://moneropay.eu/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">MoneroPay docs</a>.
              </p>
            </div>
          </details>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium text-text-secondary flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Zero-conf (0-conf)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-text-primary">
            By default, a payment is accepted after it’s fully confirmed (~20 min). Zero-conf is an optional server setting that can make payments count sooner; it can’t be changed from this dashboard.
          </p>
          <div className="rounded-lg border border-border bg-surface-hover/50 p-3 text-sm text-text-secondary">
            <p className="flex items-center gap-2 text-text-primary">
              <Info className="h-4 w-4 shrink-0 text-accent" />
              This is configured when the server is set up, not here.
            </p>
          </div>
          <details className="group rounded-lg border border-border bg-background">
            <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary [&::-webkit-details-marker]:hidden">
              <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden />
              For server admins: how to enable zero-conf
            </summary>
            <div className="border-t border-border px-3 py-2 text-xs text-text-secondary space-y-2">
              <p>
                Set <code className="rounded bg-surface-hover px-1 py-0.5 font-mono">MONEROPAY_ZERO_CONF=true</code> in <code className="rounded bg-surface-hover px-1 py-0.5 font-mono">.env</code> and restart the stack. Enabling it is faster for the customer but carries higher risk (e.g. reorgs, double-spend). <a href="https://moneropay.eu/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">MoneroPay docs</a>.
              </p>
            </div>
          </details>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium text-text-secondary flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Wallet backup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-text-primary">
            Back up your wallet so you don’t lose access to your funds. Whoever set up the server can do this from the machine where it runs.
          </p>
          <details className="group rounded-lg border border-border bg-background">
            <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary [&::-webkit-details-marker]:hidden">
              <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden />
              For server admins: backup command
            </summary>
            <div className="border-t border-border px-3 py-2 text-xs text-text-secondary space-y-2">
              <p className="text-text-secondary">
                Wallet files live in the Docker volume <code className="rounded bg-surface-hover px-1 py-0.5 font-mono">wallet-data</code>. Example:
              </p>
              <p className="font-mono text-text-primary break-all">
                docker cp $(docker compose ps -q wallet-rpc):/wallet ./wallet-backup/
              </p>
              <a href="https://moneropay.eu/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-accent hover:underline">
                MoneroPay docs <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </details>
        </CardContent>
      </Card>
    </div>
  )
}
