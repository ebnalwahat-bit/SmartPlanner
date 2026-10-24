"use client"

import { useEffect, useSyncExternalStore } from "react"
import { Plus } from "lucide-react"
import { useNotesStore } from "@/lib/notes-store"
import { useUIStore } from "@/lib/ui-store"
import { useT } from "@/lib/i18n"
import { localeMeta } from "@/lib/i18n/types"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { AppHeader, NotebookLogo, useIsClient } from "./app-header"
import { SidebarContent } from "./sidebar"
import { NotesList } from "./notes-list"
import { NoteEditor } from "./note-editor"
import { cn } from "@/lib/utils"

function Splash() {
  return (
    <div className="flex h-dvh flex-col items-center justify-center gap-4 bg-background">
      <NotebookLogo className="size-20 rounded-2xl shadow-md" />
      <div className="flex items-center gap-2">
        <div className="size-2 animate-pulse rounded-full bg-emerald-500" />
        <div className="size-2 animate-pulse rounded-full bg-emerald-500 [animation-delay:150ms]" />
        <div className="size-2 animate-pulse rounded-full bg-emerald-500 [animation-delay:300ms]" />
      </div>
    </div>
  )
}

export function NotesApp() {
  const t = useT()
  const language = useNotesStore((s) => s.language)
  const initialize = useNotesStore((s) => s.initialize)
  const createNote = useNotesStore((s) => s.createNote)
  const filter = useUIStore((s) => s.filter)
  const mobileView = useUIStore((s) => s.mobileView)
  const select = useUIStore((s) => s.select)
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen)
  const mounted = useIsClient()

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    const meta = localeMeta[language]
    document.documentElement.lang = meta.code
    document.documentElement.dir = meta.dir
  }, [language])

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return
    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* offline caching unavailable — app still works from localStorage */
      })
    }
    if (document.readyState === "complete") register()
    else {
      window.addEventListener("load", register)
      return () => window.removeEventListener("load", register)
    }
  }, [])

  if (!mounted) return <Splash />

  const handleNewNote = () => {
    const categoryId = filter.type === "category" ? filter.categoryId : null
    const id = createNote(categoryId)
    select(id)
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
      <AppHeader />

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-64 shrink-0 flex-col border-e bg-muted/30 md:flex xl:w-72">
          <SidebarContent />
        </aside>

        <div
          className={cn(
            "min-h-0 w-full md:w-auto",
            mobileView === "editor" && "hidden md:flex",
          )}
        >
          <NotesList />
        </div>

        <div className={cn("min-h-0 flex-1", mobileView === "list" && "hidden md:flex")}>
          <NoteEditor />
        </div>
      </div>

      {/* Mobile floating action button */}
      <Button
        size="icon"
        onClick={handleNewNote}
        className="fixed bottom-6 end-6 z-40 size-14 rounded-full shadow-lg md:hidden"
        aria-label={t.newNote}
      >
        <Plus className="size-6" />
      </Button>

      {/* Mobile sidebar drawer */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent
          side={language === "ar" ? "right" : "left"}
          className="w-72 gap-0 p-0 [&>button]:z-10"
        >
          <SheetHeader className="border-b px-4 py-3">
            <SheetTitle className="text-sm font-semibold text-muted-foreground">
              {t.appName}
            </SheetTitle>
            <SheetDescription className="sr-only">{t.tagline}</SheetDescription>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:thin]">
            <SidebarContent />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
