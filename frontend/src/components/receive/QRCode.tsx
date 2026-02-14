import { useMemo } from 'react'
import { QRCodeSVG } from 'qrcode.react'

export function QRCodeDisplay({
  address,
  amountPiconero,
  description,
}: {
  address: string
  amountPiconero: number
  description?: string
}) {
  const uri = useMemo(() => {
    const params = new URLSearchParams()
    const xmr = (amountPiconero / 1e12).toFixed(12).replace(/\.?0+$/, '')
    params.set('tx_amount', xmr)
    if (description) params.set('tx_description', description)
    const q = params.toString()
    return `monero:${address}${q ? `?${q}` : ''}`
  }, [address, amountPiconero, description])

  return (
    <div className="inline-flex rounded-lg border border-border bg-white p-4">
      <QRCodeSVG value={uri} size={280} level="M" includeMargin={false} />
    </div>
  )
}
