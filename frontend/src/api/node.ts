import { NODE_RPC_BASE, USE_MOCK } from '@/lib/constants'
import { mockApi } from './mock'

export interface GetInfoResult {
  height: number
  target_height: number
  synchronized: boolean
  busy_syncing: boolean
  database_size?: number
  free_space?: number
  status?: string
}

export interface GetInfoResponse {
  result: GetInfoResult
}

async function postRpc(body: object): Promise<GetInfoResponse> {
  const base = NODE_RPC_BASE.replace(/\/$/, '')
  const url = `${base}/json_rpc`
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!r.ok) throw new Error(`Node RPC failed: ${r.status}`)
  return r.json()
}

export const nodeApi = USE_MOCK
  ? mockApi.node
  : {
      async getInfo(): Promise<GetInfoResponse> {
        return postRpc({ jsonrpc: '2.0', id: '0', method: 'get_info' })
      },
    }
