"use client"

import { create } from "zustand"

export type Filter =
  | { type: "all" }
  | { type: "favorites" }
  | { type: "trash" }
  | { type: "category"; categoryId: string }

interface UIState {
  selectedId: string | null
  mobileView: "list" | "editor"
  filter: Filter
  search: string
  sidebarOpen: boolean
  select: (id: string) => void
  backToList: () => void
  setFilter: (filter: Filter) => void
  setSearch: (search: string) => void
  setSidebarOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>()((set) => ({
  selectedId: null,
  mobileView: "list",
  filter: { type: "all" },
  search: "",
  sidebarOpen: false,
  select: (id) => set({ selectedId: id, mobileView: "editor" }),
  backToList: () => set({ mobileView: "list", selectedId: null }),
  setFilter: (filter) => set({ filter, search: "", selectedId: null, mobileView: "list" }),
  setSearch: (search) => set({ search }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
}))
