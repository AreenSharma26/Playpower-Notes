"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import type { Note } from "@/types/note"
import { Search, Plus, Pin, Trash2, MoreVertical, Lock } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PasswordDialog } from "@/components/password-dialog"
import bcrypt from "bcryptjs"

interface NoteSidebarProps {
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

export function NoteSidebar({
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
}: NoteSidebarProps) {
  const [unlockingNote, setUnlockingNote] = useState<Note | null>(null)

  const handleDelete = (noteId: string, noteTitle: string) => {
    if (window.confirm(`Delete "${noteTitle}"?`)) {
      onDeleteNote(noteId)
    }
  }

  const handleNoteClick = (note: Note) => {
    if (note.isPasswordProtected && !note.isUnlocked) {
      setUnlockingNote(note)
    } else {
      onNoteSelect({ ...note, isUnlocked: true })
    }
  }

  const sortedNotes = [...notes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })

  return (
    <div className="w-80 bg-sidebar border-r border-sidebar-border flex flex-col rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <Button onClick={onNewNote} className="w-full mb-4">
          <Plus className="w-4 h-4 mr-2" />
          New Note
        </Button>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Notes list */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {sortedNotes.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">No notes found</div>
          ) : (
            sortedNotes.map((note) => (
              <div
                key={note.id}
                className={`group p-3 rounded-lg cursor-pointer transition-all duration-200 mb-2 border ${
                  activeNote?.id === note.id
                    ? "bg-sidebar-accent text-sidebar-accent-foreground border-primary/20 shadow-sm"
                    : "hover:bg-sidebar-accent/50 hover:border-border hover:shadow-sm border-transparent"
                }`}
                onClick={() => handleNoteClick(note)}
              >
                <div className="flex items-start justify-between relative">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {note.isPinned && <Pin className="w-3 h-3 text-primary" />}
                      {note.isPasswordProtected && <Lock className="w-3 h-3 text-orange-500" />}
                      <h3 className="font-medium text-sm break-words hover:text-primary transition-colors">
                        {note.title}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {typeof note.content === "string"
                        ? note.content.replace(/<[^>]*>/g, "").substring(0, 100) || "No content"
                        : "No content"}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </span>
                      {note.tags.length > 0 && (
                        <div className="flex gap-1">
                          {note.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs px-1 py-0">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-sidebar-accent/80"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          onTogglePin(note.id)
                        }}
                      >
                        <Pin className="w-4 h-4 mr-2" />
                        {note.isPinned ? "Unpin Note" : "Pin Note"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          onSetPassword(note.id)
                        }}
                      >
                        <Lock className="w-4 h-4 mr-2" />
                        {note.isPasswordProtected ? "Change Password" : "Protect with Password"}
                      </DropdownMenuItem>
                      {note.isPasswordProtected && onRemovePassword && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            onRemovePassword(note.id)
                          }}
                          className="text-orange-600"
                        >
                          <Lock className="w-4 h-4 mr-2" />
                          Remove Protection
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(note.id, note.title)
                        }}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Note
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Unlock Dialog */}
      {unlockingNote && (
        <PasswordDialog
          isOpen={!!unlockingNote}
          onClose={() => setUnlockingNote(null)}
          onSubmit={(enteredPassword) => {
            if (unlockingNote.passwordHash && bcrypt.compareSync(enteredPassword, unlockingNote.passwordHash)) {
              const unlocked = { ...unlockingNote, isUnlocked: true }
              onNoteSelect(unlocked)
              setUnlockingNote(null)
            } else {
              alert("❌ Wrong password, try again!")
            }
          }}
          title="Unlock Note"
          description="Enter password to unlock this note."
        />
      )}
    </div>
  )
}
