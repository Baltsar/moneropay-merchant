export const API_BASE = import.meta.env.VITE_MONEROPAY_URL ?? '/api'
export const NODE_RPC_BASE = import.meta.env.VITE_NODE_RPC_URL ?? '/node'
export const NODE_MODE = import.meta.env.VITE_NODE_MODE ?? 'local'
export const FIAT_CURRENCY = import.meta.env.VITE_FIAT_CURRENCY ?? 'USD'
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export const POLL_INTERVALS = {
  health: 30_000,
  balance: 15_000,
  activePayment: 5_000,
  price: 60_000,
  syncStatus: 10_000,
  syncStatusSynced: 60_000,
} as const

export const CONFIRMATIONS_REQUIRED = 10
export const MIN_PER_CONFIRMATION = 2

/** Top fiat currencies for the demo (Receive screen picker + rate fetch) */
export const FIAT_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$' },
] as const
