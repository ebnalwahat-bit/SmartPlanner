export const LOCALES = ["ar", "en", "fr", "es", "de", "tr", "ru"] as const

export type Locale = (typeof LOCALES)[number]

export interface LocaleMeta {
  code: Locale
  nativeName: string
  dir: "ltr" | "rtl"
  intlTag: string
}

export const localeMeta: Record<Locale, LocaleMeta> = {
  ar: { code: "ar", nativeName: "العربية", dir: "rtl", intlTag: "ar" },
  en: { code: "en", nativeName: "English", dir: "ltr", intlTag: "en" },
  fr: { code: "fr", nativeName: "Français", dir: "ltr", intlTag: "fr" },
  es: { code: "es", nativeName: "Español", dir: "ltr", intlTag: "es" },
  de: { code: "de", nativeName: "Deutsch", dir: "ltr", intlTag: "de" },
  tr: { code: "tr", nativeName: "Türkçe", dir: "ltr", intlTag: "tr" },
  ru: { code: "ru", nativeName: "Русский", dir: "ltr", intlTag: "ru" },
}
