import { useState } from 'react'
import { CreatePayment } from '@/components/receive/CreatePayment'
import { PaymentStatus } from '@/components/receive/PaymentStatus'
import { useRecentPayments } from '@/context/RecentPaymentsContext'

export function Receive() {
  const [active, setActive] = useState<{
    address: string
    amount: number
    description?: string
  } | null>(null)
  const { addPayment } = useRecentPayments()

  const handleCreated = (params: { address: string; amount: number; description?: string }) => {
    addPayment(params)
    setActive(params)
  }

  const handleNewPayment = () => {
    setActive(null)
  }

  if (active) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-xl font-semibold text-text-primary">Receive</h1>
        <PaymentStatus
          address={active.address}
          amountPiconero={active.amount}
          description={active.description}
          onNewPayment={handleNewPayment}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <h1 className="text-xl font-semibold text-text-primary">Receive</h1>
      <CreatePayment onCreated={handleCreated} />
    </div>
  )
}
