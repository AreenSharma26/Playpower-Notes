"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordManagement } from "@/components/password-management"
import type { Note } from "@/types/note"
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Save, Type, Lock, Sparkles } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

interface ToolbarProps {
  activeNote: Note | null
  onUpdateNote: (note: Note) => void
  onManualSave?: () => void
  onProtectNote?: (password: string) => void
  onUnprotectNote?: () => void
  onChangePassword?: (password: string) => void
}

export function Toolbar({
  activeNote,
  onUpdateNote,
  onManualSave,
  onProtectNote,
  onUnprotectNote,
  onChangePassword,
}: ToolbarProps) {
  const [isRenaming, setIsRenaming] = useState(false)
  const [newTitle, setNewTitle] = useState("")

  if (!activeNote) return null

  const handleSave = () => {
    if (onManualSave) {
      onManualSave()
    } else {
      const fileName = window.prompt("Enter file name:", activeNote.title)
      if (fileName && fileName.trim()) {
        onUpdateNote({ ...activeNote, title: fileName.trim() })
      }
    }
  }

  const handleRename = () => {
    setNewTitle(activeNote.title)
    setIsRenaming(true)
  }

  const confirmRename = () => {
    if (newTitle.trim()) {
      onUpdateNote({ ...activeNote, title: newTitle.trim() })
    }
    setIsRenaming(false)
  }

  const applyFormatting = (command: string, value?: string) => {
    document.execCommand(command, false, value)
  }

  const setFontSize = (size: "small" | "medium" | "large") => {
    const sizeMap = {
      small: "12px",
      medium: "16px",
      large: "20px",
    }
    applyFormatting("fontSize", "3")
    onUpdateNote({
      ...activeNote,
      formatting: {
        ...activeNote.formatting,
        fontSize: size,
      },
    })
  }

  const setAlignment = (alignment: "left" | "center" | "right") => {
    const alignmentMap = {
      left: "justifyLeft",
      center: "justifyCenter",
      right: "justifyRight",
    }
    applyFormatting(alignmentMap[alignment])
    onUpdateNote({
      ...activeNote,
      formatting: {
        ...activeNote.formatting,
        alignment,
      },
    })
  }

  return (
    <div className="border-t border-border bg-background p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {isRenaming ? (
            <div className="flex items-center gap-2">
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") confirmRename()
                  if (e.key === "Escape") setIsRenaming(false)
                }}
                className="w-64"
                autoFocus
              />
              <Button size="sm" onClick={confirmRename}>
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsRenaming(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-semibold cursor-pointer hover:text-primary" onClick={handleRename}>
                {activeNote.title}
              </h1>
              {activeNote.isPinned && <Badge variant="secondary">Pinned</Badge>}
              {activeNote.isPasswordProtected && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Protected
                </Badge>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onProtectNote && onUnprotectNote && onChangePassword && (
            <PasswordManagement
              note={activeNote}
              onProtect={onProtectNote}
              onUnprotect={onUnprotectNote}
              onChangePassword={onChangePassword}
            />
          )}

          <Button variant="outline" size="sm" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save As
          </Button>
          <Button variant="outline" size="sm">
            <Sparkles className="w-4 h-4 mr-2" />
            AI Features
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {/* Text Formatting */}
        <div className="flex items-center gap-1 border-r pr-2">
          <Button variant="outline" size="sm" onClick={() => applyFormatting("bold")}>
            <Bold className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => applyFormatting("italic")}>
            <Italic className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => applyFormatting("underline")}>
            <Underline className="w-4 h-4" />
          </Button>
        </div>

        {/* Font Size */}
        <div className="flex items-center gap-1 border-r pr-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Type className="w-4 h-4 mr-1" />
                Size
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFontSize("small")}>Small</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFontSize("medium")}>Medium</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFontSize("large")}>Large</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={() => setAlignment("left")}>
            <AlignLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setAlignment("center")}>
            <AlignCenter className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setAlignment("right")}>
            <AlignRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
