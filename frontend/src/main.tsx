import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LocaleProvider } from '@/context/LocaleContext'
import { FiatCurrencyProvider } from '@/context/FiatCurrencyContext'
import { RecentPaymentsProvider } from '@/context/RecentPaymentsContext'
import { BalanceVisibilityProvider } from '@/context/BalanceVisibilityContext'
import './index.css'
import App from './App'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <LocaleProvider>
        <FiatCurrencyProvider>
          <BalanceVisibilityProvider>
            <RecentPaymentsProvider>
              <App />
            </RecentPaymentsProvider>
          </BalanceVisibilityProvider>
        </FiatCurrencyProvider>
      </LocaleProvider>
    </QueryClientProvider>
  </StrictMode>,
)
