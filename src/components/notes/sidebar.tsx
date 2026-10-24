"use client"

import { useRef, useState } from "react"
import { toast } from "sonner"
import {
  Download,
  FileText,
  FolderPlus,
  Layers,
  Star,
  Trash2,
  TriangleAlert,
  Upload,
  X,
} from "lucide-react"
import { useNotesStore } from "@/lib/notes-store"
import { useUIStore, type Filter } from "@/lib/ui-store"
import { useT } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { CategoryDialog } from "./category-dialog"
import { cn } from "@/lib/utils"

export function SidebarContent() {
  const t = useT()
  const notes = useNotesStore((s) => s.notes)
  const categories = useNotesStore((s) => s.categories)
  const importData = useNotesStore((s) => s.importData)
  const deleteCategory = useNotesStore((s) => s.deleteCategory)
  const clearAll = useNotesStore((s) => s.clearAll)
  const filter = useUIStore((s) => s.filter)
  const setFilter = useUIStore((s) => s.setFilter)
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [pendingCategory, setPendingCategory] = useState<string | null>(null)
  const [clearDialogOpen, setClearDialogOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const activeNotes = notes.filter((n) => n.deletedAt === null)
  const favCount = activeNotes.filter((n) => n.favorite).length
  const trashCount = notes.filter((n) => n.deletedAt !== null).length

  const navItems: { key: Filter; label: string; icon: typeof Layers; count: number }[] = [
    { key: { type: "all" }, label: t.allNotes, icon: Layers, count: activeNotes.length },
    { key: { type: "favorites" }, label: t.favorites, icon: Star, count: favCount },
    { key: { type: "trash" }, label: t.trash, icon: Trash2, count: trashCount },
  ]

  const isActive = (key: Filter) => {
    if (key.type === "category" && filter.type === "category") {
      return filter.categoryId === key.categoryId
    }
    return filter.type === key.type
  }

  const handleExport = () => {
    const state = useNotesStore.getState()
    const payload = {
      app: "mudhakira",
      version: 1,
      exportedAt: new Date().toISOString(),
      notes: state.notes,
      categories: state.categories,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `mudhakira-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(t.exportDone)
  }

  const handleImportFile = async (file: File) => {
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      const result = importData(data)
      if (!result) {
        toast.error(t.importError)
        return
      }
      toast.success(t.importSuccess)
    } catch {
      toast.error(t.importError)
    }
  }

  const categoryCount = (categoryId: string) =>
    activeNotes.filter((n) => n.categoryId === categoryId).length

  return (
    <div className="flex h-full flex-col">
      <nav className="flex flex-col gap-1 p-3" aria-label={t.appName}>
        {navItems.map((item) => (
          <button
            key={item.key.type}
            type="button"
            onClick={() => setFilter(item.key)}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
              isActive(item.key)
                ? "bg-primary text-primary-foreground"
                : "text-foreground/80 hover:bg-accent",
            )}
          >
            <item.icon className="size-4 shrink-0" />
            <span className="truncate">{item.label}</span>
            {item.count > 0 && (
              <Badge
                variant="secondary"
                className={cn(
                  "ms-auto h-5 min-w-5 px-1.5 text-[11px]",
                  isActive(item.key) && "bg-primary-foreground/20 text-primary-foreground",
                )}
              >
                {item.count}
              </Badge>
            )}
          </button>
        ))}
      </nav>

      <Separator />

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-center justify-between px-4 pb-1 pt-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t.categories}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => setCategoryDialogOpen(true)}
            aria-label={t.newCategory}
          >
            <FolderPlus className="size-4" />
          </Button>
        </div>

        <div className="max-h-72 min-h-0 flex-1 overflow-y-auto px-3 pb-2 [scrollbar-width:thin]">
          {categories.length === 0 ? (
            <p className="px-3 py-2 text-xs text-muted-foreground">{t.noCategory}</p>
          ) : (
            categories.map((cat) => (
              <div key={cat.id} className="group/cat relative">
                <button
                  type="button"
                  onClick={() => setFilter({ type: "category", categoryId: cat.id })}
                  className={cn(
                    "flex min-h-10 w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive({ type: "category", categoryId: cat.id })
                      ? "bg-accent font-medium"
                      : "text-foreground/80 hover:bg-accent",
                  )}
                >
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: cat.color }}
                    aria-hidden="true"
                  />
                  <span className="truncate pe-6">{cat.name}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPendingCategory(cat.id)}
                  className="absolute end-2 top-1/2 hidden -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive group-hover/cat:block"
                  aria-label={t.delete}
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        <Separator className="mt-auto" />

        <div className="space-y-1 p-3">
          <h2 className="px-1 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t.dataManagement}
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-11 gap-1.5"
              onClick={handleExport}
            >
              <Download className="size-4" />
              <span className="text-xs">{t.exportData}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-11 gap-1.5"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="size-4" />
              <span className="text-xs">{t.importData}</span>
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void handleImportFile(file)
              e.target.value = ""
            }}
          />
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-full gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setClearDialogOpen(true)}
          >
            <TriangleAlert className="size-3.5" />
            <span className="text-xs">{t.clearAllData}</span>
          </Button>
        </div>
      </div>

      <CategoryDialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen} />

      <AlertDialog open={pendingCategory !== null} onOpenChange={(o) => !o && setPendingCategory(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.deleteCategoryTitle}</AlertDialogTitle>
            <AlertDialogDescription>{t.deleteCategoryDesc}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                if (pendingCategory) {
                  deleteCategory(pendingCategory)
                  if (filter.type === "category" && filter.categoryId === pendingCategory) {
                    setFilter({ type: "all" })
                  }
                }
                setPendingCategory(null)
              }}
            >
              {t.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.clearDataTitle}</AlertDialogTitle>
            <AlertDialogDescription>{t.clearDataDesc}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                clearAll()
                setFilter({ type: "all" })
                setClearDialogOpen(false)
                toast.success(t.dataCleared)
              }}
            >
              {t.clearAllData}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export function SidebarFooterInfo() {
  const t = useT()
  return (
    <div className="flex items-center gap-2 px-4 py-3 text-xs text-muted-foreground">
      <FileText className="size-3.5 text-emerald-500" />
      <span>{t.offlineReady}</span>
    </div>
  )
}
