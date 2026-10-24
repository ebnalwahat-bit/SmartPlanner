"use client"

import { useSyncExternalStore } from "react"
import { useTheme } from "next-themes"
import { Check, Globe, Menu, Moon, Sun, Wifi, WifiOff } from "lucide-react"
import { useNotesStore } from "@/lib/notes-store"
import { useUIStore } from "@/lib/ui-store"
import { useT } from "@/lib/i18n"
import { LOCALES, localeMeta, type Locale } from "@/lib/i18n/types"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export function NotebookLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="116" fill="url(#logo-grad)" />
      <rect x="140" y="104" width="232" height="304" rx="28" fill="#ffffff" />
      <path d="M292 104 h48 v64 l-24 -20 l-24 20 Z" fill="#fbbf24" />
      <rect x="172" y="212" width="168" height="22" rx="11" fill="#059669" opacity="0.9" />
      <rect x="172" y="260" width="168" height="22" rx="11" fill="#059669" opacity="0.55" />
      <rect x="172" y="308" width="116" height="22" rx="11" fill="#059669" opacity="0.35" />
    </svg>
  )
}

const subscribeNetwork = (callback: () => void) => {
  window.addEventListener("online", callback)
  window.addEventListener("offline", callback)
  return () => {
    window.removeEventListener("online", callback)
    window.removeEventListener("offline", callback)
  }
}

const emptySubscribe = () => () => {}

/** false during SSR / hydration, true on the client afterwards */
export function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  )
}

function useOnline() {
  return useSyncExternalStore(
    subscribeNetwork,
    () => navigator.onLine,
    () => true,
  )
}

export function AppHeader() {
  const t = useT()
  const language = useNotesStore((s) => s.language)
  const setLanguage = useNotesStore((s) => s.setLanguage)
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen)
  const { resolvedTheme, setTheme } = useTheme()
  const online = useOnline()
  const mounted = useIsClient()

  const switchLang = (code: Locale) => {
    setLanguage(code)
  }

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/75 sm:px-4">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setSidebarOpen(true)}
        aria-label={t.menu}
      >
        <Menu className="size-5" />
      </Button>

      <div className="flex items-center gap-2.5">
        <NotebookLogo className="size-9 rounded-lg shadow-sm" />
        <div className="leading-tight">
          <h1 className="text-base font-bold tracking-tight">{t.appName}</h1>
          <p className="hidden text-xs text-muted-foreground sm:block">{t.tagline}</p>
        </div>
      </div>

      <div className="ms-auto flex items-center gap-1.5">
        <div
          className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs text-muted-foreground"
          role="status"
          aria-live="polite"
        >
          {online ? (
            <Wifi className="size-3.5 text-emerald-500" />
          ) : (
            <WifiOff className="size-3.5 text-amber-500" />
          )}
          <span className="hidden sm:inline">{online ? t.online : t.offline}</span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1.5" aria-label={t.language}>
              <Globe className="size-4" />
              <span className="hidden text-sm sm:inline">{localeMeta[language].nativeName}</span>
              <span className="text-xs font-semibold uppercase sm:hidden">{language}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel>{t.language}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {LOCALES.map((code) => (
              <DropdownMenuItem key={code} onClick={() => switchLang(code)} className="gap-2">
                <span className="w-4">
                  {language === code && <Check className="size-4 text-emerald-500" />}
                </span>
                <span className={cn(language === code && "font-semibold")}>
                  {localeMeta[code].nativeName}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          aria-label={t.theme}
        >
          {mounted && resolvedTheme === "dark" ? (
            <Sun className="size-5" />
          ) : (
            <Moon className="size-5" />
          )}
        </Button>
      </div>
    </header>
  )
}
