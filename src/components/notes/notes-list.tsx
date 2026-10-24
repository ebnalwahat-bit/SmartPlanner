"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import {
  ArrowDownUp,
  FileText,
  Pin,
  Plus,
  RotateCcw,
  Search,
  SearchX,
  Star,
  Trash2,
  X,
} from "lucide-react"
import { useNotesStore, type Note } from "@/lib/notes-store"
import { useUIStore } from "@/lib/ui-store"
import { useT, formatDate, useLocale } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"

function startOfDay(ts: number) {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function isSameDay(a: number, b: number) {
  return startOfDay(a) === startOfDay(b)
}

function NoteCard({ note }: { note: Note }) {
  const t = useT()
  const locale = useLocale()
  const categories = useNotesStore((s) => s.categories)
  const select = useUIStore((s) => s.select)
  const selectedId = useUIStore((s) => s.selectedId)
  const inTrash = note.deletedAt !== null
  const category = categories.find((c) => c.id === note.categoryId)
  const selected = selectedId === note.id

  const dateToShow = inTrash
    ? `${t.deletedAt}: ${formatDate(note.deletedAt, locale)}`
    : formatDate(note.updatedAt, locale)

  if (inTrash) {
    return (
      <div
        className={cn(
          "w-full rounded-xl border p-4 transition-colors",
          selected ? "border-primary/60 bg-accent" : "hover:bg-accent/50",
        )}
      >
        <button
          type="button"
          onClick={() => select(note.id)}
          className="w-full text-start"
          aria-label={note.title || t.untitled}
        >
          <h3 className="line-clamp-1 font-semibold text-sm">
            {note.title || t.untitled}
          </h3>
          <p className="mt-1 line-clamp-2 whitespace-pre-wrap text-xs text-muted-foreground">
            {note.content || t.contentPlaceholder}
          </p>
        </button>
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-[11px] text-muted-foreground">{dateToShow}</span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1 px-2 text-xs"
              onClick={() => {
                useNotesStore.getState().restoreNote(note.id)
                toast.success(t.noteRestored)
              }}
            >
              <RotateCcw className="size-3.5" />
              {t.restore}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => {
                useNotesStore.getState().deleteNoteForever(note.id)
                if (selected) useUIStore.getState().backToList()
                toast.success(t.noteDeletedForever)
              }}
            >
              <X className="size-3.5" />
              {t.deleteForever}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      onClick={() => select(note.id)}
      className={cn(
        "w-full rounded-xl border p-4 text-start shadow-sm transition-all hover:shadow",
        selected ? "border-primary/60 bg-accent shadow-sm" : "bg-card hover:bg-accent/50",
      )}
      style={
        note.color
          ? {
              backgroundColor: `${note.color}1f`,
              borderColor: selected ? undefined : `${note.color}66`,
            }
          : undefined
      }
      aria-current={selected ? "true" : undefined}
    >
      <div className="flex items-start gap-1.5">
        <h3 className="line-clamp-1 flex-1 font-semibold text-sm">
          {note.title || t.untitled}
        </h3>
        {note.pinned && <Pin className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />}
        {note.favorite && <Star className="mt-0.5 size-3.5 shrink-0 fill-amber-400 text-amber-400" />}
      </div>
      {note.content && (
        <p className="mt-1 line-clamp-2 whitespace-pre-wrap text-xs text-muted-foreground">
          {note.content}
        </p>
      )}
      {note.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {note.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-secondary-foreground"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
      <div className="mt-2.5 flex items-center gap-2 text-[11px] text-muted-foreground">
        {category && (
          <span className="flex items-center gap-1">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: category.color }}
              aria-hidden="true"
            />
            <span className="max-w-24 truncate">{category.name}</span>
          </span>
        )}
        <span className="ms-auto">{dateToShow}</span>
      </div>
    </motion.button>
  )
}

export function NotesList() {
  const t = useT()
  const notes = useNotesStore((s) => s.notes)
  const sortBy = useNotesStore((s) => s.sortBy)
  const setSortBy = useNotesStore((s) => s.setSortBy)
  const createNote = useNotesStore((s) => s.createNote)
  const emptyTrash = useNotesStore((s) => s.emptyTrash)
  const filter = useUIStore((s) => s.filter)
  const search = useUIStore((s) => s.search)
  const setSearch = useUIStore((s) => s.setSearch)
  const select = useUIStore((s) => s.select)

  const isTrash = filter.type === "trash"

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    let list = notes.filter((n) => (isTrash ? n.deletedAt !== null : n.deletedAt === null))
    if (filter.type === "favorites") list = list.filter((n) => n.favorite)
    if (filter.type === "category") list = list.filter((n) => n.categoryId === filter.categoryId)
    if (q) {
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.tags.some((tag) => tag.toLowerCase().includes(q)),
      )
    }
    const sorted = [...list].sort((a, b) => {
      if (sortBy === "title") {
        return (a.title || a.content).localeCompare(b.title || b.content, undefined, {
          sensitivity: "base",
        })
      }
      if (sortBy === "created") return b.createdAt - a.createdAt
      return b.updatedAt - a.updatedAt
    })
    return sorted
  }, [notes, filter, search, sortBy, isTrash])

  const groups = useMemo(() => {
    if (isTrash || sortBy === "title") {
      return [{ label: "", notes: filtered }]
    }
    const dateOf = (n: Note) => (sortBy === "created" ? n.createdAt : n.updatedAt)
    const pinned = filtered.filter((n) => n.pinned)
    const rest = filtered.filter((n) => !n.pinned)
    const now = Date.now()
    const today: Note[] = []
    const yesterday: Note[] = []
    const earlier: Note[] = []
    for (const n of rest) {
      const d = dateOf(n)
      if (isSameDay(d, now)) today.push(n)
      else if (isSameDay(d, now - 86400_000)) yesterday.push(n)
      else earlier.push(n)
    }
    return [
      { label: pinned.length ? t.pinned : "", notes: pinned },
      { label: today.length ? t.today : "", notes: today },
      { label: yesterday.length ? t.yesterday : "", notes: yesterday },
      { label: earlier.length ? t.earlier : "", notes: earlier },
    ].filter((g) => g.notes.length > 0)
  }, [filtered, isTrash, sortBy, t])

  const handleNewNote = () => {
    const categoryId = filter.type === "category" ? filter.categoryId : null
    const id = createNote(categoryId)
    select(id)
  }

  const sortLabels: Record<string, string> = {
    updated: t.recentlyEdited,
    created: t.recentlyCreated,
    title: t.alphabetical,
  }

  const emptyState = search
    ? { icon: SearchX, title: t.noResultsTitle, desc: t.noResultsDesc }
    : isTrash
      ? { icon: Trash2, title: t.emptyTrashTitle, desc: t.emptyTrashDesc }
      : { icon: FileText, title: t.emptyTitle, desc: t.emptyDesc }

  return (
    <section
      aria-label={t.allNotes}
      className="flex min-h-0 w-full flex-col border-e bg-background md:w-80 lg:w-96"
    >
      <div className="space-y-2.5 border-b p-3">
        {!isTrash && (
          <Button onClick={handleNewNote} className="h-11 w-full gap-2 font-semibold">
            <Plus className="size-4" />
            {t.newNote}
          </Button>
        )}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.searchNotes}
              className="h-10 ps-9 pe-9"
              aria-label={t.search}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute end-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={t.clearSearch}
              >
                <X className="size-4" />
              </button>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="size-10 shrink-0" aria-label={t.sortBy}>
                <ArrowDownUp className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>{t.sortBy}</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={sortBy}
                onValueChange={(v) => setSortBy(v as typeof sortBy)}
              >
                {(["updated", "created", "title"] as const).map((key) => (
                  <DropdownMenuRadioItem key={key} value={key} className="gap-2">
                    {sortLabels[key]}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {isTrash && filtered.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="h-10 w-full gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive">
                <Trash2 className="size-4" />
                {t.emptyTrash}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t.emptyTrashTitle2}</AlertDialogTitle>
                <AlertDialogDescription>{t.emptyTrashDesc2}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-white hover:bg-destructive/90"
                  onClick={() => {
                    emptyTrash()
                    useUIStore.getState().backToList()
                    toast.success(t.trashEmptied)
                  }}
                >
                  {t.emptyTrash}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3 pb-24 md:pb-3 [scrollbar-width:thin]">
        {filtered.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-secondary">
              <emptyState.icon className="size-7 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">{emptyState.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{emptyState.desc}</p>
              {!isTrash && !search && (
                <Button onClick={handleNewNote} className="mt-4 gap-2" size="sm">
                  <Plus className="size-4" />
                  {t.newNote}
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {groups.map((group, gi) => (
              <div key={group.label || gi} className="space-y-2">
                {group.label && (
                  <h2 className="px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {group.label}
                  </h2>
                )}
                <div className="space-y-2">
                  {group.notes.map((note) => (
                    <NoteCard key={note.id} note={note} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t px-4 py-2 text-xs text-muted-foreground" aria-live="polite">
        {t.notesCount(filtered.length)}
      </div>
    </section>
  )
}
