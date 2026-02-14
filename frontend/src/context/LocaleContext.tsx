import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Locale } from '@/lib/translations'

const STORAGE_KEY = 'moneropay_locale'

const LocaleContext = createContext<{
  locale: Locale
  setLocale: (locale: Locale) => void
}>({ locale: 'en', setLocale: () => {} })

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setState] = useState<Locale>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === 'es' || stored === 'en') return stored
      return 'en'
    } catch {
      return 'en'
    }
  })

  const setLocale = useCallback((value: Locale) => {
    setState(value)
    try {
      localStorage.setItem(STORAGE_KEY, value)
    } catch {
      // ignore
    }
  }, [])

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  return useContext(LocaleContext)
}
