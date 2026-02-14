import { useQuery } from '@tanstack/react-query'
import { moneropayApi } from '@/api/moneropay'
import { POLL_INTERVALS } from '@/lib/constants'

export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => moneropayApi.getHealth(),
    refetchInterval: POLL_INTERVALS.health,
    retry: 2,
    retryDelay: 2000,
  })
}
