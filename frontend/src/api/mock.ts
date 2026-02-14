import type {
  HealthResponse,
  BalanceResponse,
  ReceiveRequest,
  ReceiveResponse,
  ReceiveStatusResponse,
  TransferRequest,
  TransferResponse,
} from './moneropay'
import type { GetInfoResponse } from './node'

const MOCK_ADDRESS = '84WsptnEBiRNDBnomU7JhirHxMi4h8hNrFZcE1A9dB3n3BcYbHVhkAMpZgK2RnC9ZA8bNX8k3ovEh2nTRKFhEAL8Yqrg'

const store: {
  health: HealthResponse
  balance: BalanceResponse
  syncStartTime: number
  syncStartHeight: number
  receiveRequests: Map<string, { created: number; amount: number; description?: string; confirmations: number; doubleSpend: boolean; coveredPct: number }>
} = {
  health: { status: 200, services: { walletrpc: true, postgresql: true } },
  balance: {
    total: 2513444800000,
    unlocked: 800000000000,
    locked: 1713444800000,
  },
  syncStartTime: Date.now(),
  syncStartHeight: 3200000,
  receiveRequests: new Map(),
}

function mockHealth(): Promise<HealthResponse> {
  return Promise.resolve(store.health)
}

function mockBalance(): Promise<BalanceResponse> {
  return Promise.resolve(store.balance)
}

function mockSyncStatus(): Promise<GetInfoResponse> {
  const elapsed = (Date.now() - store.syncStartTime) / 1000
  const progress = Math.min(1, elapsed / 30)
  const targetHeight = 3300000
  const height = Math.floor(store.syncStartHeight + (targetHeight - store.syncStartHeight) * progress)
  const synchronized = progress >= 1
  return Promise.resolve({
    result: {
      height,
      target_height: synchronized ? 0 : targetHeight,
      synchronized,
      busy_syncing: !synchronized,
      status: 'OK',
    },
  })
}

function mockPostReceive(body: ReceiveRequest): Promise<ReceiveResponse> {
  const address = `${MOCK_ADDRESS.slice(0, 20)}${Date.now().toString(36)}${MOCK_ADDRESS.slice(-20)}`
  const doubleSpend = (body.description ?? '').toLowerCase().includes('test-double-spend')
  store.receiveRequests.set(address, {
    created: Date.now(),
    amount: body.amount,
    description: body.description,
    confirmations: 0,
    doubleSpend,
    coveredPct: body.description?.toLowerCase().includes('partial') ? 0.5 : 1,
  })
  return Promise.resolve({
    address,
    amount: body.amount,
    description: body.description,
    created_at: new Date().toISOString(),
  })
}

function getReceiveStatus(address: string): Promise<ReceiveStatusResponse> {
  const req = store.receiveRequests.get(address)
  if (!req) {
    return Promise.reject(new Error('Not found'))
  }
  const elapsed = (Date.now() - req.created) / 1000
  const confProgress = Math.min(10, Math.floor(elapsed / 2))
  const coveredPct = elapsed > 5 ? 1 : req.coveredPct
  const totalCovered = Math.floor(req.amount * coveredPct)
  const unlockedCovered = confProgress >= 10 ? totalCovered : 0
  const tx = {
    amount: totalCovered,
    confirmations: confProgress,
    double_spend_seen: req.doubleSpend,
    fee: 9200000,
    height: 2402648 + confProgress,
    timestamp: new Date().toISOString(),
    tx_hash: `0c9a7b40${address.slice(-8)}`,
    unlock_time: 0,
    locked: confProgress < 10,
  }
  return Promise.resolve({
    amount: { expected: req.amount, covered: { total: totalCovered, unlocked: unlockedCovered } },
    complete: confProgress >= 10 && coveredPct >= 1,
    description: req.description,
    created_at: new Date(req.created).toISOString(),
    transactions: confProgress > 0 ? [tx] : [],
  })
}

function mockPostTransfer(body: TransferRequest): Promise<TransferResponse> {
  const d = body.destinations[0]
  return Promise.resolve({
    amount: d.amount,
    fee: 87438594,
    tx_hash: `5ca34${Date.now().toString(36)}`,
    tx_hash_list: [],
    destinations: body.destinations,
  })
}

export const mockApi = {
  moneropay: {
    getHealth: mockHealth,
    getBalance: mockBalance,
    postReceive: mockPostReceive,
    getReceive: getReceiveStatus,
    postTransfer: mockPostTransfer,
    getTransfer: async () => ({ transactions: [] }),
  },
  node: {
    getInfo: mockSyncStatus,
  },
}

export async function fetchPrice(): Promise<{
  usd?: number
  eur?: number
  gbp?: number
  chf?: number
  cad?: number
  mxn?: number
}> {
  return Promise.resolve({
    usd: 165.42,
    eur: 152.1,
    gbp: 130.2,
    chf: 145.2,
    cad: 225.1,
    mxn: 2850,
  })
}
