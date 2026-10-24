import { useNotesStore } from "@/lib/notes-store"
import { dict } from "./dict"
import { localeMeta, type Locale } from "./types"

export function useT() {
  const language = useNotesStore((s) => s.language)
  return dict[language]
}

export function useLocale(): Locale {
  return useNotesStore((s) => s.language)
}

export function formatDate(timestamp: number, locale: Locale, withTime = false) {
  const meta = localeMeta[locale]
  try {
    return new Intl.DateTimeFormat(meta.intlTag, {
      dateStyle: "medium",
      ...(withTime ? { timeStyle: "short" as const } : {}),
    }).format(new Date(timestamp))
  } catch {
    return new Date(timestamp).toLocaleDateString()
  }
}

export { dict, localeMeta }
export type { Locale }
