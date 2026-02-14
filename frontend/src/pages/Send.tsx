import { SendForm } from '@/components/send/SendForm'

export function Send() {
  return (
    <div className="mx-auto max-w-md space-y-6">
      <h1 className="text-xl font-semibold text-text-primary">Send</h1>
      <SendForm />
    </div>
  )
}
