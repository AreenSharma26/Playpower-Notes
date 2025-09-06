"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { NoteSidebar } from "@/components/note-sidebar"
import type { Note } from "@/types/note"
import { Menu, X } from "lucide-react"

interface MobileSidebarProps {
  notes: Note[]
  activeNote: Note | null
  searchQuery: string
  onSearchChange: (query: string) => void
  onNoteSelect: (note: Note) => void
  onNewNote: () => void
  onDeleteNote: (noteId: string) => void
  onTogglePin: (noteId: string) => void
  onSetPassword: (noteId: string) => void
  onRemovePassword?: (noteId: string) => void
}

export function MobileSidebar({
  notes,
  activeNote,
  searchQuery,
  onSearchChange,
  onNoteSelect,
  onNewNote,
  onDeleteNote,
  onTogglePin,
  onSetPassword,
  onRemovePassword,
}: MobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleNoteSelect = (note: Note) => {
    onNoteSelect(note)
    setIsOpen(false) // Close sidebar on mobile after selecting note
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="md:hidden bg-transparent">
          <Menu className="w-4 h-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-80">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold">Notes</h2>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <NoteSidebar
          notes={notes}
          activeNote={activeNote}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onNoteSelect={handleNoteSelect}
          onNewNote={onNewNote}
          onDeleteNote={onDeleteNote}
          onTogglePin={onTogglePin}
          onSetPassword={onSetPassword}
          onRemovePassword={onRemovePassword}
        />
      </SheetContent>
    </Sheet>
  )
}
