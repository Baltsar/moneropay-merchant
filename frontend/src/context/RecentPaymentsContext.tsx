import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

const STORAGE_KEY = 'moneropay_recent_addresses'
const MAX_RECENT = 20

export interface RecentPaymentMeta {
  address: string
  amount: number
  description?: string
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

function saveItems(items: RecentPaymentMeta[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_RECENT)))
  } catch {
    // ignore
  }
}

const RecentPaymentsContext = createContext<{
  items: RecentPaymentMeta[]
  addPayment: (meta: RecentPaymentMeta) => void
  removePayment: (address: string) => void
}>({ items: [], addPayment: () => {}, removePayment: () => {} })

export function RecentPaymentsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<RecentPaymentMeta[]>(loadItems)

  const addPayment = useCallback((meta: RecentPaymentMeta) => {
    setItems((prev) => {
      const next = [meta, ...prev.filter((i) => i.address !== meta.address)].slice(0, MAX_RECENT)
      saveItems(next)
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

  return (
    <RecentPaymentsContext.Provider value={{ items, addPayment, removePayment }}>
      {children}
    </RecentPaymentsContext.Provider>
  )
}

export function useRecentPayments() {
  return useContext(RecentPaymentsContext)
}
