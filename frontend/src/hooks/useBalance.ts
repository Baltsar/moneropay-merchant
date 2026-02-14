import { useQuery } from '@tanstack/react-query'
import { moneropayApi } from '@/api/moneropay'
import { POLL_INTERVALS } from '@/lib/constants'

export function useBalance() {
  return useQuery({
    queryKey: ['balance'],
    queryFn: () => moneropayApi.getBalance(),
    refetchInterval: POLL_INTERVALS.balance,
  })
}
