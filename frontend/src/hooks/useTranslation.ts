import { useLocale } from '@/context/LocaleContext'
import { t as translate, type TranslationKey } from '@/lib/translations'

export function useTranslation() {
  const { locale } = useLocale()
  const t = (key: TranslationKey, vars?: Record<string, string | number>) => translate(locale, key, vars)
  return { t, locale }
}
