"use client"

import { useState } from "react"
import { toast } from "sonner"
import { useNotesStore, CATEGORY_COLORS } from "@/lib/notes-store"
import { useT } from "@/lib/i18n"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export function CategoryDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const t = useT()
  const addCategory = useNotesStore((s) => s.addCategory)
  const [name, setName] = useState("")
  const [color, setColor] = useState<string>(CATEGORY_COLORS[0])

  const handleAdd = () => {
    const id = addCategory(name, color)
    if (!id) return
    setName("")
    setColor(CATEGORY_COLORS[0])
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t.newCategory}</DialogTitle>
          <DialogDescription className="sr-only">{t.newCategory}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-1">
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd()
            }}
            placeholder={t.categoryName}
            aria-label={t.categoryName}
            className="h-11"
          />
          <div>
            <p className="mb-2 text-sm text-muted-foreground">{t.chooseColor}</p>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t.chooseColor}>
              {CATEGORY_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={color === c}
                  onClick={() => setColor(c)}
                  className={cn(
                    "size-8 rounded-full border-2 transition-transform hover:scale-110",
                    color === c ? "border-foreground" : "border-transparent",
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t.cancel}
          </Button>
          <Button onClick={handleAdd} disabled={!name.trim()}>
            {t.addCategory}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
