import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3 } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

export function VolumeChart() {
  const { t } = useTranslation()
  const hasVolumeData = false

  if (!hasVolumeData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium text-text-secondary">
            {t('volumeChartTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface-hover/50 text-center">
            <BarChart3 className="mb-3 h-12 w-12 text-text-secondary/60" aria-hidden />
            <p className="text-sm font-medium text-text-secondary">{t('noVolumeYet')}</p>
            <p className="mt-1 text-xs text-text-secondary">
              {t('volumeHint')}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium text-text-secondary">
          {t('volumeChartTitle')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full" />
      </CardContent>
    </Card>
  )
}
