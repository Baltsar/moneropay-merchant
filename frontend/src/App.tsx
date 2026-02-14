import { useHealth } from '@/hooks/useHealth'
import { useSyncStatus } from '@/hooks/useSyncStatus'
import { NODE_MODE } from '@/lib/constants'
import type { GetInfoResult } from '@/api/node'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Onboarding } from '@/pages/Onboarding'
import { Dashboard } from '@/pages/Dashboard'
import { Receive } from '@/pages/Receive'
import { Send } from '@/pages/Send'
import { Settings } from '@/pages/Settings'

function SyncGate({ children }: { children: React.ReactNode }) {
  const { data: health } = useHealth()
  const { data: syncStatus } = useSyncStatus()

  const isMoneroPayReachable = health !== undefined
  const isWalletRpcUp = health?.services?.walletrpc === true
  const isDbUp = health?.services?.postgresql === true
  const isNodeSynced = NODE_MODE === 'remote' || (syncStatus as GetInfoResult | undefined)?.synchronized === true
  const isSystemReady = isMoneroPayReachable && isWalletRpcUp && isDbUp && isNodeSynced

  if (!isSystemReady) {
    return <Onboarding />
  }

  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="receive" element={<Receive />} />
        <Route path="send" element={<Send />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <SyncGate>
        <AppRoutes />
      </SyncGate>
    </BrowserRouter>
  )
}
