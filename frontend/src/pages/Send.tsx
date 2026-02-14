import { SendForm } from '@/components/send/SendForm'
import { DefaultCurrencyPicker } from '@/components/receive/DefaultCurrencyPicker'
import { useTranslation } from '@/hooks/useTranslation'

export function Send() {
  const { t } = useTranslation()
  return (
    <div className="mx-auto max-w-md space-y-6">
      <h1 className="text-xl font-semibold text-text-primary">{t('send')}</h1>
      <DefaultCurrencyPicker />
      <SendForm />
    </div>
  )
}
