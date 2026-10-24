"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { dict } from "@/lib/i18n/dict"
import type { Locale } from "@/lib/i18n/types"

export type SortBy = "updated" | "created" | "title"

export interface Note {
  id: string
  title: string
  content: string
  categoryId: string | null
  tags: string[]
  pinned: boolean
  favorite: boolean
  color: string | null
  createdAt: number
  updatedAt: number
  deletedAt: number | null
}

export interface Category {
  id: string
  name: string
  color: string
}

export interface NotesState {
  notes: Note[]
  categories: Category[]
  language: Locale
  sortBy: SortBy
  initialized: boolean
  setLanguage: (language: Locale) => void
  setSortBy: (sortBy: SortBy) => void
  initialize: () => void
  createNote: (categoryId?: string | null) => string
  updateNote: (id: string, patch: Partial<Note>) => void
  moveNoteToTrash: (id: string) => void
  restoreNote: (id: string) => void
  deleteNoteForever: (id: string) => void
  emptyTrash: () => void
  togglePin: (id: string) => void
  toggleFavorite: (id: string) => void
  addCategory: (name: string, color?: string) => string | null
  deleteCategory: (id: string) => void
  importData: (raw: unknown) => { notes: number; categories: number } | null
  clearAll: () => void
}

export const CATEGORY_COLORS = [
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
  "#f97316",
] as const

function uid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

function sanitizeNote(raw: unknown): Note | null {
  if (typeof raw !== "object" || raw === null) return null
  const r = raw as Record<string, unknown>
  if (typeof r.id !== "string") return null
  return {
    id: r.id,
    title: typeof r.title === "string" ? r.title : "",
    content: typeof r.content === "string" ? r.content : "",
    categoryId: typeof r.categoryId === "string" ? r.categoryId : null,
    tags: Array.isArray(r.tags) ? r.tags.filter((t): t is string => typeof t === "string") : [],
    pinned: typeof r.pinned === "boolean" ? r.pinned : false,
    favorite: typeof r.favorite === "boolean" ? r.favorite : false,
    color: typeof r.color === "string" ? r.color : null,
    createdAt: typeof r.createdAt === "number" ? r.createdAt : Date.now(),
    updatedAt: typeof r.updatedAt === "number" ? r.updatedAt : Date.now(),
    deletedAt: typeof r.deletedAt === "number" ? r.deletedAt : null,
  }
}

function sanitizeCategory(raw: unknown): Category | null {
  if (typeof raw !== "object" || raw === null) return null
  const r = raw as Record<string, unknown>
  if (typeof r.id !== "string" || typeof r.name !== "string") return null
  return {
    id: r.id,
    name: r.name,
    color: typeof r.color === "string" ? r.color : CATEGORY_COLORS[0],
  }
}

export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      notes: [],
      categories: [],
      language: "ar",
      sortBy: "updated",
      initialized: false,

      setLanguage: (language) => set({ language }),
      setSortBy: (sortBy) => set({ sortBy }),

      initialize: () => {
        if (get().initialized) return
        const lang = get().language
        const t = dict[lang]
        const now = Date.now()
        const personal: Category = { id: uid(), name: t.defaultCategoryPersonal, color: "#10b981" }
        const work: Category = { id: uid(), name: t.defaultCategoryWork, color: "#f59e0b" }
        const ideas: Category = { id: uid(), name: t.defaultCategoryIdeas, color: "#8b5cf6" }
        set({
          categories: [personal, work, ideas],
          initialized: true,
          notes: [
            {
              id: uid(),
              title: t.welcomeTitle,
              content: t.welcomeBody,
              categoryId: personal.id,
              tags: [],
              pinned: true,
              favorite: true,
              color: "#10b981",
              createdAt: now,
              updatedAt: now,
              deletedAt: null,
            },
            {
              id: uid(),
              title: t.featuresTitle,
              content: t.featuresBody,
              categoryId: ideas.id,
              tags: [],
              pinned: false,
              favorite: false,
              color: null,
              createdAt: now - 3600_000,
              updatedAt: now - 3600_000,
              deletedAt: null,
            },
          ],
        })
      },

      createNote: (categoryId = null) => {
        const id = uid()
        const now = Date.now()
        const note: Note = {
          id,
          title: "",
          content: "",
          categoryId,
          tags: [],
          pinned: false,
          favorite: false,
          color: null,
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
        }
        set((s) => ({ notes: [note, ...s.notes] }))
        return id
      },

      updateNote: (id, patch) =>
        set((s) => ({
          notes: s.notes.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n)),
        })),

      moveNoteToTrash: (id) =>
        set((s) => ({
          notes: s.notes.map((n) =>
            n.id === id ? { ...n, deletedAt: Date.now(), pinned: false } : n,
          ),
        })),

      restoreNote: (id) =>
        set((s) => ({
          notes: s.notes.map((n) => (n.id === id ? { ...n, deletedAt: null, updatedAt: Date.now() } : n)),
        })),

      deleteNoteForever: (id) => set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),

      emptyTrash: () => set((s) => ({ notes: s.notes.filter((n) => n.deletedAt === null) })),

      togglePin: (id) =>
        set((s) => ({
          notes: s.notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)),
        })),

      toggleFavorite: (id) =>
        set((s) => ({
          notes: s.notes.map((n) => (n.id === id ? { ...n, favorite: !n.favorite } : n)),
        })),

      addCategory: (name, color) => {
        const trimmed = name.trim()
        if (!trimmed) return null
        const exists = get().categories.some(
          (c) => c.name.toLowerCase() === trimmed.toLowerCase(),
        )
        if (exists) return null
        const id = uid()
        const nextColor = color ?? CATEGORY_COLORS[get().categories.length % CATEGORY_COLORS.length]
        set((s) => ({ categories: [...s.categories, { id, name: trimmed, color: nextColor }] }))
        return id
      },

      deleteCategory: (id) =>
        set((s) => ({
          categories: s.categories.filter((c) => c.id !== id),
          notes: s.notes.map((n) => (n.categoryId === id ? { ...n, categoryId: null } : n)),
        })),

      importData: (raw) => {
        if (typeof raw !== "object" || raw === null) return null
        const data = raw as Record<string, unknown>
        if (!Array.isArray(data.notes) || !Array.isArray(data.categories)) return null
        const notes = data.notes.map(sanitizeNote).filter((n): n is Note => n !== null)
        const categories = data.categories
          .map(sanitizeCategory)
          .filter((c): c is Category => c !== null)
        if (notes.length === 0 && categories.length === 0) return null
        set((s) => {
          const noteMap = new Map(s.notes.map((n) => [n.id, n]))
          for (const n of notes) noteMap.set(n.id, n)
          const catMap = new Map(s.categories.map((c) => [c.id, c]))
          for (const c of categories) catMap.set(c.id, c)
          return { notes: [...noteMap.values()], categories: [...catMap.values()], initialized: true }
        })
        return { notes: notes.length, categories: categories.length }
      },

      clearAll: () => set({ notes: [], categories: [], initialized: true }),
    }),
    { name: "mudhakira-store", version: 1 },
  ),
)
