import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CreatePayment } from '@/components/receive/CreatePayment'
import { DefaultCurrencyPicker } from '@/components/receive/DefaultCurrencyPicker'
import { PaymentStatus } from '@/components/receive/PaymentStatus'
import { useRecentPayments } from '@/context/RecentPaymentsContext'
import { useTranslation } from '@/hooks/useTranslation'

export function Receive() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const [active, setActive] = useState<{
    address: string
    amount: number
    description?: string
  } | null>(null)
  const { addPayment } = useRecentPayments()

  useEffect(() => {
    const state = location.state as { address?: string; amount?: number; description?: string } | null
    if (state?.address) {
      setActive({
        address: state.address,
        amount: typeof state.amount === 'number' ? state.amount : 0,
        description: state.description,
      })
    }
  }, [location.state])

  const handleCreated = (params: { address: string; amount: number; description?: string }) => {
    addPayment(params)
    setActive(params)
  }

  const handleNewPayment = () => {
    setActive(null)
    navigate('/receive', { replace: true, state: {} })
  }

  if (active) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-xl font-semibold text-text-primary">{t('receive')}</h1>
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
      <h1 className="text-xl font-semibold text-text-primary">{t('receive')}</h1>
      <DefaultCurrencyPicker />
      <CreatePayment onCreated={handleCreated} />
    </div>
  )
}
