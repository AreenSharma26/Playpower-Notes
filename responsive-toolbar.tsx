"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordManagement } from "@/components/password-management"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import type { Note } from "@/types/note"
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Save, Type, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

interface ResponsiveToolbarProps {
  activeNote: Note | null
  onUpdateNote: (note: Note) => void
  onManualSave?: () => void
  onProtectNote?: (password: string) => void
  onUnprotectNote?: () => void
  onChangePassword?: (password: string) => void
}

export function ResponsiveToolbar({
  activeNote,
  onUpdateNote,
  onManualSave,
  onProtectNote,
  onUnprotectNote,
  onChangePassword,
}: ResponsiveToolbarProps) {
  const [isRenaming, setIsRenaming] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [showMobileTools, setShowMobileTools] = useState(false)

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
    <div className="border-t border-border bg-background p-3 md:p-4">
      {/* Title Section */}
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isRenaming ? (
            <div className="flex items-center gap-2 w-full">
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") confirmRename()
                  if (e.key === "Escape") setIsRenaming(false)
                }}
                className="flex-1 text-sm md:text-base"
                autoFocus
              />
              <Button size="sm" onClick={confirmRename}>
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsRenaming(false)} className="hidden sm:flex">
                Cancel
              </Button>
            </div>
          ) : (
            <>
              <h1
                className="text-lg md:text-xl font-semibold cursor-pointer hover:text-primary truncate"
                onClick={handleRename}
              >
                {activeNote.title}
              </h1>
              <div className="flex items-center gap-1 flex-shrink-0">
                {activeNote.isPinned && (
                  <Badge variant="secondary" className="text-xs">
                    Pinned
                  </Badge>
                )}
                {activeNote.isPasswordProtected && (
                  <Badge variant="outline" className="text-xs">
                    Protected
                  </Badge>
                )}
              </div>
            </>
          )}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2">
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
        </div>

        {/* Mobile Actions */}
        <div className="flex md:hidden items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSave}>
            <Save className="w-4 h-4" />
          </Button>
          <Sheet open={showMobileTools} onOpenChange={setShowMobileTools}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-auto">
              <div className="space-y-4 pb-4">
                <h3 className="font-semibold">Note Actions</h3>
                {onProtectNote && onUnprotectNote && onChangePassword && (
                  <PasswordManagement
                    note={activeNote}
                    onProtect={onProtectNote}
                    onUnprotect={onUnprotectNote}
                    onChangePassword={onChangePassword}
                  />
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Formatting Tools */}
      <div className="space-y-3">
        {/* Desktop Formatting */}
        <div className="hidden md:flex items-center gap-2 flex-wrap">
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

        {/* Mobile Formatting */}
        <div className="flex md:hidden items-center gap-2 overflow-x-auto pb-2">
          <Button variant="outline" size="sm" onClick={() => applyFormatting("bold")} className="flex-shrink-0">
            <Bold className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => applyFormatting("italic")} className="flex-shrink-0">
            <Italic className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => applyFormatting("underline")} className="flex-shrink-0">
            <Underline className="w-4 h-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex-shrink-0 bg-transparent">
                <Type className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFontSize("small")}>Small</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFontSize("medium")}>Medium</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFontSize("large")}>Large</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" onClick={() => setAlignment("left")} className="flex-shrink-0">
            <AlignLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setAlignment("center")} className="flex-shrink-0">
            <AlignCenter className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setAlignment("right")} className="flex-shrink-0">
            <AlignRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
