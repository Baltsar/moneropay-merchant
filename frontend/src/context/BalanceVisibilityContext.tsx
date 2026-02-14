import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'

const STORAGE_KEY = 'moneropay_balance_visible'

function loadVisible(): boolean {
  try {
    const s = localStorage.getItem(STORAGE_KEY)
    if (s === null) return true
    return s === 'true'
  } catch {
    return true
  }
}

const BalanceVisibilityContext = createContext<{
  balanceVisible: boolean
  setBalanceVisible: (visible: boolean) => void
  toggleBalanceVisible: () => void
}>({
  balanceVisible: true,
  setBalanceVisible: () => {},
  toggleBalanceVisible: () => {},
})

export function BalanceVisibilityProvider({ children }: { children: ReactNode }) {
  const [balanceVisible, setState] = useState(loadVisible)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(balanceVisible))
    } catch {
      // ignore
    }
  }, [balanceVisible])

  const setBalanceVisible = useCallback((visible: boolean) => {
    setState(visible)
  }, [])

  const toggleBalanceVisible = useCallback(() => {
    setState((v) => !v)
  }, [])

  return (
    <BalanceVisibilityContext.Provider
      value={{ balanceVisible, setBalanceVisible, toggleBalanceVisible }}
    >
      {children}
    </BalanceVisibilityContext.Provider>
  )
}

export function useBalanceVisibility() {
  return useContext(BalanceVisibilityContext)
}
