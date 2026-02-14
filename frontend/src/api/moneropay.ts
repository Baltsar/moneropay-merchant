import { API_BASE, USE_MOCK } from '@/lib/constants'
import { mockApi } from './mock'

export interface HealthResponse {
  status: number
  services: {
    walletrpc: boolean
    postgresql: boolean
  }
}

export interface BalanceResponse {
  total: number
  unlocked: number
  locked: number
}

export interface ReceiveRequest {
  amount: number
  description?: string
  callback_url?: string
}

export interface ReceiveResponse {
  address: string
  amount: number
  description?: string
  created_at: string
}

export interface ReceiveTx {
  amount: number
  confirmations: number
  double_spend_seen: boolean
  fee: number
  height: number
  timestamp: string
  tx_hash: string
  unlock_time: number
  locked: boolean
}

export interface ReceiveStatusResponse {
  amount: {
    expected: number
    covered: {
      total: number
      unlocked: number
    }
  }
  complete: boolean
  description?: string
  created_at: string
  transactions: ReceiveTx[]
}

export interface TransferDestination {
  amount: number
  address: string
}

export interface TransferRequest {
  destinations: TransferDestination[]
}

export interface TransferResponse {
  amount: number
  fee: number
  tx_hash: string
  tx_hash_list: string[]
  destinations: TransferDestination[]
}

async function fetchApi(path: string, options?: RequestInit): Promise<Response> {
  const base = API_BASE.replace(/\/$/, '')
  const url = path.startsWith('/') ? `${base}${path}` : `${base}/${path}`
  return fetch(url, { ...options, headers: { 'Content-Type': 'application/json', ...options?.headers } })
}

export const moneropayApi = USE_MOCK
  ? mockApi.moneropay
  : {
      async getHealth(): Promise<HealthResponse> {
        const r = await fetchApi('/health')
        if (!r.ok) throw new Error(`Health failed: ${r.status}`)
        return r.json()
      },
      async getBalance(): Promise<BalanceResponse> {
        const r = await fetchApi('/balance')
        if (!r.ok) throw new Error(`Balance failed: ${r.status}`)
        return r.json()
      },
      async postReceive(body: ReceiveRequest): Promise<ReceiveResponse> {
        const r = await fetchApi('/receive', { method: 'POST', body: JSON.stringify(body) })
        if (!r.ok) throw new Error(`Receive failed: ${r.status}`)
        return r.json()
      },
      async getReceive(address: string): Promise<ReceiveStatusResponse> {
        const r = await fetchApi(`/receive/${encodeURIComponent(address)}`)
        if (!r.ok) throw new Error(`Receive status failed: ${r.status}`)
        return r.json()
      },
      async postTransfer(body: TransferRequest): Promise<TransferResponse> {
        const r = await fetchApi('/transfer', { method: 'POST', body: JSON.stringify(body) })
        if (!r.ok) throw new Error(`Transfer failed: ${r.status}`)
        return r.json()
      },
      async getTransfer(txHash: string): Promise<{ transactions: ReceiveTx[] }> {
        const r = await fetchApi(`/transfer/${encodeURIComponent(txHash)}`)
        if (!r.ok) throw new Error(`Transfer status failed: ${r.status}`)
        return r.json()
      },
    }
