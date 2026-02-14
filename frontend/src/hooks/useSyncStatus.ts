import { useQuery } from '@tanstack/react-query'
import { useRef, useMemo } from 'react'
import { nodeApi } from '@/api/node'
import type { GetInfoResult } from '@/api/node'
import { POLL_INTERVALS } from '@/lib/constants'
import { NODE_MODE } from '@/lib/constants'


export function calcSyncProgress(height: number, targetHeight: number): number {
  if (targetHeight === 0) return height > 0 ? 100 : 0
  return Math.min(99.9, (height / targetHeight) * 100)
}

export function calcETA(
  height: number,
  targetHeight: number,
  prevHeight: number,
  elapsedMs: number
): string {
  const blocksRemaining = targetHeight - height
  if (blocksRemaining <= 0) return 'Almost done...'
  const elapsedSec = elapsedMs / 1000
  const blocksPerSec = elapsedSec > 0 ? (height - prevHeight) / elapsedSec : 0
  if (blocksPerSec <= 0) return 'Calculating...'
  const secondsRemaining = blocksRemaining / blocksPerSec
  if (secondsRemaining > 86400) return `~${Math.round(secondsRemaining / 3600)} hours`
  if (secondsRemaining > 3600) return `~${Math.round(secondsRemaining / 3600)} hours`
  if (secondsRemaining > 60) return `~${Math.round(secondsRemaining / 60)} minutes`
  return 'Almost done...'
}

export function useSyncStatus() {
  const prevHeightRef = useRef<number>(0)
  const prevTimeRef = useRef<number>(Date.now())

  const query = useQuery<GetInfoResult>({
    queryKey: ['syncStatus'],
    queryFn: async () => {
      const res = await nodeApi.getInfo()
      return res.result
    },
    enabled: NODE_MODE === 'local',
    refetchInterval: (q) =>
      (q.state.data as GetInfoResult | undefined)?.synchronized
        ? POLL_INTERVALS.syncStatusSynced
        : POLL_INTERVALS.syncStatus,
  })

  const { eta, blocksPerSec } = useMemo(() => {
    const data = query.data as GetInfoResult | undefined
    if (!data || data.synchronized) return { eta: null as string | null, blocksPerSec: 0 }
    const now = Date.now()
    const elapsed = now - prevTimeRef.current
    const etaStr = calcETA(data.height, data.target_height || data.height, prevHeightRef.current, elapsed)
    const blocksPerSec = elapsed > 0 ? (data.height - prevHeightRef.current) / (elapsed / 1000) : 0
    prevHeightRef.current = data.height
    prevTimeRef.current = now
    return { eta: etaStr, blocksPerSec }
  }, [query.data])

  const progress = useMemo(() => {
    const data = query.data as GetInfoResult | undefined
    if (!data) return 0
    return calcSyncProgress(data.height, data.target_height || data.height || 1)
  }, [query.data])

  return {
    ...query,
    progress,
    eta: (query.data as GetInfoResult | undefined)?.synchronized ? null : eta,
    blocksPerSec: (query.data as GetInfoResult | undefined)?.synchronized ? 0 : blocksPerSec,
  }
}
