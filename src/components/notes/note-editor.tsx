"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import {
  ArrowLeft,
  Check,
  Palette,
  Pin,
  Plus,
  Star,
  StickyNote,
  Trash2,
  X,
} from "lucide-react"
import { useNotesStore, CATEGORY_COLORS, type Note } from "@/lib/notes-store"
import { useUIStore } from "@/lib/ui-store"
import { useT, formatDate, useLocale } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export function NoteEditor() {
  const t = useT()
  const selectedId = useUIStore((s) => s.selectedId)
  const notes = useNotesStore((s) => s.notes)

  const note = useMemo(() => notes.find((n) => n.id === selectedId) ?? null, [notes, selectedId])

  if (!note) {
    return (
      <section
        aria-label={t.selectNoteTitle}
        className="hidden min-w-0 flex-1 flex-col items-center justify-center gap-4 bg-muted/30 p-8 text-center md:flex"
      >
        <div className="flex size-20 items-center justify-center rounded-2xl bg-primary/10">
          <StickyNote className="size-9 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">{t.selectNoteTitle}</h2>
          <p className="mt-1 max-w-64 text-sm text-muted-foreground">{t.selectNoteDesc}</p>
        </div>
      </section>
    )
  }

  return <EditorInner key={note.id} note={note} />
}

function EditorInner({ note }: { note: Note }) {
  const t = useT()
  const locale = useLocale()
  const backToList = useUIStore((s) => s.backToList)
  const categories = useNotesStore((s) => s.categories)
  const updateNote = useNotesStore((s) => s.updateNote)
  const moveNoteToTrash = useNotesStore((s) => s.moveNoteToTrash)

  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [tagInput, setTagInput] = useState("")
  const [savedFlash, setSavedFlash] = useState(false)
  const latest = useRef({ title: note.title, content: note.content })
  const titleRef = useRef<HTMLTextAreaElement>(null)

  // Focus the title field when a brand-new empty note opens
  useEffect(() => {
    if (!note.title && !note.content) titleRef.current?.focus()
  }, [])

  // Flush unsaved edits when this note instance unmounts (e.g. user switches notes mid-typing)
  useEffect(() => {
    return () => {
      const { title: t2, content: c2 } = latest.current
      const state = useNotesStore.getState()
      const current = state.notes.find((n) => n.id === note.id)
      if (current && current.deletedAt === null && (t2 !== current.title || c2 !== current.content)) {
        state.updateNote(note.id, { title: t2, content: c2 })
      }
    }
  }, [])

  // Debounced auto-save
  useEffect(() => {
    latest.current = { title, content }
    if (title === note.title && content === note.content) return
    if (note.deletedAt !== null) return
    const handle = setTimeout(() => {
      updateNote(note.id, { title, content })
      setSavedFlash(true)
      setTimeout(() => setSavedFlash(false), 1600)
    }, 400)
    return () => clearTimeout(handle)
  }, [title, content, note, updateNote])

  const inTrash = note.deletedAt !== null
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0
  const charCount = content.length

  const addTag = () => {
    const tag = tagInput.trim().replace(/^#/, "")
    if (!tag) return
    if (!note.tags.includes(tag)) {
      updateNote(note.id, { tags: [...note.tags, tag] })
    }
    setTagInput("")
  }

  return (
    <motion.section
      key={note.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      aria-label={note.title || t.untitled}
      className="flex min-h-0 min-w-0 flex-1 flex-col bg-background"
    >
      {inTrash && (
        <div className="flex flex-wrap items-center gap-2 border-b bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
          <Trash2 className="size-4" />
          <span className="me-auto">{t.inTrash}</span>
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5"
            onClick={() => {
              useNotesStore.getState().restoreNote(note.id)
              toast.success(t.noteRestored)
            }}
          >
            {t.restore}
          </Button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5 border-b px-3 py-2">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={backToList}
          aria-label={t.backToList}
        >
          <ArrowLeft className="size-5 rtl:rotate-180" />
        </Button>

        <Select
          value={note.categoryId ?? "none"}
          onValueChange={(v) => updateNote(note.id, { categoryId: v === "none" ? null : v })}
          disabled={inTrash}
        >
          <SelectTrigger className="h-9 w-auto max-w-40 gap-1.5 text-xs" aria-label={t.categories}>
            <SelectValue placeholder={t.noCategory} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none" className="text-xs">
              {t.noCategory}
            </SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id} className="text-xs">
                <span className="flex items-center gap-2">
                  <span
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: c.color }}
                    aria-hidden="true"
                  />
                  {c.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="size-9" disabled={inTrash} aria-label={t.noteColor}>
              <Palette className="size-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" align="start">
            <p className="mb-2 text-xs text-muted-foreground">{t.noteColor}</p>
            <div className="flex max-w-44 flex-wrap gap-2">
              <button
                type="button"
                onClick={() => updateNote(note.id, { color: null })}
                className={cn(
                  "flex size-7 items-center justify-center rounded-full border transition-transform hover:scale-110",
                  !note.color ? "border-foreground" : "border-border",
                )}
                aria-label={t.noCategory}
              >
                <X className="size-3.5" />
              </button>
              {CATEGORY_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => updateNote(note.id, { color: c })}
                  className={cn(
                    "size-7 rounded-full border-2 transition-transform hover:scale-110",
                    note.color === c ? "border-foreground" : "border-transparent",
                  )}
                  style={{ backgroundColor: c }}
                  aria-label={c}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn("size-9", note.pinned && "text-emerald-500")}
                onClick={() => useNotesStore.getState().togglePin(note.id)}
                disabled={inTrash}
                aria-label={note.pinned ? t.unpin : t.pin}
              >
                <Pin className={cn("size-4", note.pinned && "fill-emerald-500")} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{note.pinned ? t.unpin : t.pin}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn("size-9", note.favorite && "text-amber-500")}
                onClick={() => useNotesStore.getState().toggleFavorite(note.id)}
                disabled={inTrash}
                aria-label={note.favorite ? t.unfavorite : t.favorite}
              >
                <Star className={cn("size-4", note.favorite && "fill-amber-400")} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{note.favorite ? t.unfavorite : t.favorite}</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Button
          variant="ghost"
          size="icon"
          className="ms-auto size-9 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => {
            moveNoteToTrash(note.id)
            backToList()
            toast.success(t.noteMovedToTrash, {
              action: {
                label: t.restore,
                onClick: () => useNotesStore.getState().restoreNote(note.id),
              },
            })
          }}
          aria-label={t.delete}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      {/* Title + content */}
      <div className="flex min-h-0 flex-1 flex-col px-4 py-3 sm:px-6">
        <textarea
          ref={titleRef}
          dir="auto"
          value={title}
          onChange={(e) => setTitle(e.target.value.replace(/\n/g, ""))}
          placeholder={t.titlePlaceholder}
          disabled={inTrash}
          rows={1}
          className="w-full resize-none bg-transparent text-xl font-bold tracking-tight outline-none placeholder:text-muted-foreground sm:text-2xl"
          aria-label={t.titlePlaceholder}
        />

        {/* Tags */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {note.tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground"
            >
              #{tag}
              {!inTrash && (
                <button
                  type="button"
                  onClick={() =>
                    updateNote(note.id, { tags: note.tags.filter((x) => x !== tag) })
                  }
                  className="text-muted-foreground hover:text-foreground"
                  aria-label={`${t.delete} #${tag}`}
                >
                  <X className="size-3" />
                </button>
              )}
            </span>
          ))}
          {!inTrash && (
            <span className="flex items-center gap-1 rounded-full border border-dashed px-2.5 py-1">
              <Plus className="size-3 text-muted-foreground" />
              <input
                dir="auto"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addTag()
                  }
                }}
                onBlur={addTag}
                placeholder={t.tagPlaceholder}
                className="w-20 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
                aria-label={t.addTag}
              />
            </span>
          )}
        </div>

        <div
          className="mt-2 min-h-0 flex-1"
          style={note.color ? { backgroundColor: `${note.color}14`, borderRadius: "0.75rem", padding: "0.75rem" } : undefined}
        >
          <Textarea
            dir="auto"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t.contentPlaceholder}
            disabled={inTrash}
            className="h-full min-h-48 w-full resize-none border-0 bg-transparent p-0 text-base leading-relaxed shadow-none outline-none focus-visible:ring-0 dark:bg-transparent"
            aria-label={t.contentPlaceholder}
          />
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-3 border-t px-4 py-2 text-xs text-muted-foreground sm:px-6">
        <span className={cn("flex items-center gap-1", savedFlash && "text-emerald-600 dark:text-emerald-400")}>
          <Check className={cn("size-3.5", !savedFlash && "opacity-40")} />
          {t.autoSave}
        </span>
        <span>
          {wordCount} {t.words} · {charCount} {t.chars}
        </span>
        <span className="ms-auto hidden sm:inline">
          {t.lastEdited}: {formatDate(note.updatedAt, locale, true)}
        </span>
      </div>
    </motion.section>
  )
}
