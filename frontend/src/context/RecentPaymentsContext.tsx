import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

const STORAGE_KEY = 'moneropay_recent_addresses'
const SENDS_STORAGE_KEY = 'moneropay_recent_sends'
const MAX_RECENT = 20

export interface RecentPaymentMeta {
  address: string
  amount: number
  description?: string
  createdAt?: number
}

export interface RecentSendMeta {
  txHash: string
  amount: number
  destinationAddress: string
  createdAt: number
}

function loadItems(): RecentPaymentMeta[] {
  try {
    const s = localStorage.getItem(STORAGE_KEY)
    if (!s) return []
    const a = JSON.parse(s) as RecentPaymentMeta[]
    return Array.isArray(a) ? a.slice(0, MAX_RECENT) : []
  } catch {
    return []
  }
}

function loadSends(): RecentSendMeta[] {
  try {
    const s = localStorage.getItem(SENDS_STORAGE_KEY)
    if (!s) return []
    const a = JSON.parse(s) as RecentSendMeta[]
    return Array.isArray(a) ? a.slice(0, MAX_RECENT) : []
  } catch {
    return []
  }
}

function saveItems(items: RecentPaymentMeta[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_RECENT)))
  } catch {
    // ignore
  }
}

function saveSends(sends: RecentSendMeta[]) {
  try {
    localStorage.setItem(SENDS_STORAGE_KEY, JSON.stringify(sends.slice(0, MAX_RECENT)))
  } catch {
    // ignore
  }
}

const RecentPaymentsContext = createContext<{
  items: RecentPaymentMeta[]
  sends: RecentSendMeta[]
  addPayment: (meta: RecentPaymentMeta) => void
  addSend: (meta: Omit<RecentSendMeta, 'createdAt'>) => void
  removePayment: (address: string) => void
  removeSend: (txHash: string) => void
}>({
  items: [],
  sends: [],
  addPayment: () => {},
  addSend: () => {},
  removePayment: () => {},
  removeSend: () => {},
})

export function RecentPaymentsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<RecentPaymentMeta[]>(loadItems)
  const [sends, setSends] = useState<RecentSendMeta[]>(loadSends)

  const addPayment = useCallback((meta: RecentPaymentMeta) => {
    setItems((prev) => {
      const withTime = { ...meta, createdAt: meta.createdAt ?? Date.now() }
      const next = [withTime, ...prev.filter((i) => i.address !== meta.address)].slice(0, MAX_RECENT)
      saveItems(next)
      return next
    })
  }, [])

  const addSend = useCallback((meta: Omit<RecentSendMeta, 'createdAt'>) => {
    setSends((prev) => {
      const withTime = { ...meta, createdAt: Date.now() }
      const next = [withTime, ...prev.filter((s) => s.txHash !== meta.txHash)].slice(0, MAX_RECENT)
      saveSends(next)
      return next
    })
  }, [])

  const removePayment = useCallback((address: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.address !== address)
      saveItems(next)
      return next
    })
  }, [])

  const removeSend = useCallback((txHash: string) => {
    setSends((prev) => {
      const next = prev.filter((s) => s.txHash !== txHash)
      saveSends(next)
      return next
    })
  }, [])

  return (
    <RecentPaymentsContext.Provider value={{ items, sends, addPayment, addSend, removePayment, removeSend }}>
      {children}
    </RecentPaymentsContext.Provider>
  )
}

export function useRecentPayments() {
  return useContext(RecentPaymentsContext)
}
