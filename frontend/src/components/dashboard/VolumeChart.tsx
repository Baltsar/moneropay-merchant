import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatXMR } from '@/lib/utils'

const MOCK_DAYS = 7
function getMockData() {
  const now = Date.now()
  const day = 86400 * 1000
  return Array.from({ length: MOCK_DAYS }, (_, i) => {
    const date = new Date(now - (MOCK_DAYS - 1 - i) * day)
    return {
      date: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      xmr: 0.1 + Math.random() * 0.5,
      piconero: Math.round((0.1 + Math.random() * 0.5) * 1e12),
    }
  })
}

export function VolumeChart() {
  const data = useMemo(getMockData, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium text-text-secondary">
          7-Day Volume
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="volumeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF6600" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#FF6600" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#8A8A8A" fontSize={12} />
              <YAxis stroke="#8A8A8A" fontSize={12} tickFormatter={(v) => formatXMR(v * 1e12)} />
              <Tooltip
                contentStyle={{ backgroundColor: '#141414', border: '1px solid #262626' }}
                formatter={(value: unknown) => [
                  formatXMR(Number(value) * 1e12) + ' XMR',
                  'Received',
                ]}
                labelFormatter={(label) => String(label)}
              />
              <Area
                type="monotone"
                dataKey="xmr"
                stroke="#FF6600"
                fill="url(#volumeGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
