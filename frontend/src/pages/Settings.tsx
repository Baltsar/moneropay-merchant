import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DefaultCurrencyPicker } from '@/components/receive/DefaultCurrencyPicker'
import { NODE_MODE } from '@/lib/constants'
import { ChevronDown, Coins, ExternalLink, Globe, Info, Server, Wallet, Zap } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { useLocale } from '@/context/LocaleContext'

const MONEROPAY_DOCS_URL = 'https://moneropay.eu/'

export function Settings() {
  const { t } = useTranslation()
  const { locale, setLocale } = useLocale()
  const nodeMode = NODE_MODE === 'remote' ? t('nodeModeRemote') : t('nodeModeLocal')

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold text-text-primary">{t('settings')}</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium text-text-secondary flex items-center gap-2">
            <Globe className="h-4 w-4" />
            {t('language')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setLocale('en')}
              title={t('languageEnglish')}
              aria-label={t('languageEnglish')}
              aria-pressed={locale === 'en'}
              className={`rounded-lg border-2 p-3 text-3xl transition-all focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background ${
                locale === 'en'
                  ? 'border-accent bg-accent/10 shadow-md'
                  : 'border-border bg-surface-hover hover:border-text-secondary hover:bg-surface'
              }`}
            >
              <span role="img" aria-hidden>🇺🇸</span>
            </button>
            <button
              type="button"
              onClick={() => setLocale('es')}
              title={t('languageSpanish')}
              aria-label={t('languageSpanish')}
              aria-pressed={locale === 'es'}
              className={`rounded-lg border-2 p-3 text-3xl transition-all focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background ${
                locale === 'es'
                  ? 'border-accent bg-accent/10 shadow-md'
                  : 'border-border bg-surface-hover hover:border-text-secondary hover:bg-surface'
              }`}
            >
              <span role="img" aria-hidden>🇪🇸</span>
            </button>
          </div>
          <p className="text-xs text-text-secondary">
            {locale === 'en' ? t('languageEnglish') : t('languageSpanish')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium text-text-secondary flex items-center gap-2">
            <Coins className="h-4 w-4" />
            {t('defaultCurrency')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DefaultCurrencyPicker />
          <p className="mt-2 text-xs text-text-secondary">{t('currencyHint')}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium text-text-secondary flex items-center gap-2">
            <Server className="h-4 w-4" />
            {t('nodeAndBackend')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-text-primary">
            {t('nodeModeHint', { mode: nodeMode })}
          </p>
          <div className="rounded-lg border border-border bg-surface-hover/50 p-3 text-sm text-text-secondary">
            <p className="flex items-center gap-2 text-text-primary">
              <Info className="h-4 w-4 shrink-0 text-accent" />
              {t('cannotChangeMode')}
            </p>
          </div>
          <details className="group rounded-lg border border-border bg-background">
            <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary [&::-webkit-details-marker]:hidden">
              <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden />
              {t('forAdminsNodeMode')}
            </summary>
            <div className="border-t border-border px-3 py-2 text-xs text-text-secondary space-y-2">
              <p>
                {t('envEditIntro')}
                <a href={MONEROPAY_DOCS_URL} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                  {t('moneroPayDocs')}
                </a>
                .
              </p>
            </div>
          </details>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium text-text-secondary flex items-center gap-2">
            <Zap className="h-4 w-4" />
            {t('zeroConf')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-text-primary">
            {t('zeroConfHint')}
          </p>
          <div className="rounded-lg border border-border bg-surface-hover/50 p-3 text-sm text-text-secondary">
            <p className="flex items-center gap-2 text-text-primary">
              <Info className="h-4 w-4 shrink-0 text-accent" />
              {t('configuredOnServer')}
            </p>
          </div>
          <details className="group rounded-lg border border-border bg-background">
            <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary [&::-webkit-details-marker]:hidden">
              <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden />
              {t('forAdminsZeroConf')}
            </summary>
            <div className="border-t border-border px-3 py-2 text-xs text-text-secondary space-y-2">
              <p>
                {t('zeroConfEnvIntro')}
                <a href={MONEROPAY_DOCS_URL} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                  {t('moneroPayDocs')}
                </a>
                .
              </p>
            </div>
          </details>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium text-text-secondary flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            {t('walletBackup')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-text-primary">
            {t('walletBackupHint')}
          </p>
          <details className="group rounded-lg border border-border bg-background">
            <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary [&::-webkit-details-marker]:hidden">
              <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden />
              {t('forAdminsBackup')}
            </summary>
            <div className="border-t border-border px-3 py-2 text-xs text-text-secondary space-y-2">
              <p className="text-text-secondary">
                {t('walletFilesLive')} <code className="rounded bg-surface-hover px-1 py-0.5 font-mono">{t('walletDataVolume')}</code>. Example:
              </p>
              <p className="font-mono text-text-primary break-all">
                {t('backupExample')}
              </p>
              <a href={MONEROPAY_DOCS_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-accent hover:underline">
                {t('moneroPayDocs')} <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </details>
        </CardContent>
      </Card>
    </div>
  )
}
