import { useQuery } from '@tanstack/react-query'
import { moneropayApi } from '@/api/moneropay'
import type { ReceiveStatusResponse } from '@/api/moneropay'
import { POLL_INTERVALS } from '@/lib/constants'

export function usePaymentStatus(address: string | null, enabled: boolean) {
  return useQuery<ReceiveStatusResponse>({
    queryKey: ['receive', address],
    queryFn: () => moneropayApi.getReceive(address!),
    enabled: !!address && enabled,
    refetchInterval: POLL_INTERVALS.activePayment,
  })
}
