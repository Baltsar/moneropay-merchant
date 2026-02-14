import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

const KEY = 'moneropay_fiat_currency'

const FiatCurrencyContext = createContext<{
  fiatCurrency: string
  setFiatCurrency: (c: string) => void
}>({ fiatCurrency: 'USD', setFiatCurrency: () => {} })

export function FiatCurrencyProvider({ children }: { children: ReactNode }) {
  const [fiatCurrency, setState] = useState(() => {
    try {
      return localStorage.getItem(KEY) ?? 'USD'
    } catch {
      return 'USD'
    }
  })

  const setFiatCurrency = useCallback((c: string) => {
    setState(c)
    try {
      localStorage.setItem(KEY, c)
    } catch {
      // ignore
    }
  }, [])

  return (
    <FiatCurrencyContext.Provider value={{ fiatCurrency, setFiatCurrency }}>
      {children}
    </FiatCurrencyContext.Provider>
  )
}

export function useFiatCurrency() {
  return useContext(FiatCurrencyContext)
}
