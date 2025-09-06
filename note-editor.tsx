"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import type { Note } from "@/types/note"
import type { UserPreferences } from "@/lib/storage"

interface NoteEditorProps {
  note: Note
  onUpdateNote: (note: Note) => void
  preferences: UserPreferences
  content?: string
  onSelectionChange?: (selectedText: string) => void // Added callback for text selection
}

export function NoteEditor({ note, onUpdateNote, preferences, content, onSelectionChange }: NoteEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [selectedText, setSelectedText] = useState("")

  const handleSelectionChange = () => {
    const selection = window.getSelection()
    if (selection && selection.toString().trim()) {
      const selected = selection.toString().trim()
      setSelectedText(selected)
      onSelectionChange?.(selected)
    } else {
      setSelectedText("")
      onSelectionChange?.("")
    }
  }

  const validateContent = (rawContent: any): string => {
    if (rawContent === null || rawContent === undefined) {
      return ""
    }

    if (typeof rawContent === "string") {
      return rawContent
    }

    if (typeof rawContent === "object") {
      // If it's a note object, extract the content
      if (rawContent.content && typeof rawContent.content === "string") {
        return rawContent.content
      }
      // Convert object to empty string to prevent [object Object] display
      return ""
    }

    return String(rawContent)
  }

  const displayContent = validateContent(content !== undefined ? content : note.content)

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== displayContent) {
      editorRef.current.innerHTML = displayContent
    }
  }, [note.id, displayContent])

  useEffect(() => {
    const editor = editorRef.current
    if (editor) {
      editor.addEventListener("mouseup", handleSelectionChange)
      editor.addEventListener("keyup", handleSelectionChange)
      document.addEventListener("selectionchange", handleSelectionChange)

      return () => {
        editor.removeEventListener("mouseup", handleSelectionChange)
        editor.removeEventListener("keyup", handleSelectionChange)
        document.removeEventListener("selectionchange", handleSelectionChange)
      }
    }
  }, [])

  const handleInput = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML
      if (content !== undefined) {
        onUpdateNote(newContent as any)
      } else {
        onUpdateNote({ ...note, content: newContent })
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case "b":
          e.preventDefault()
          document.execCommand("bold")
          break
        case "i":
          e.preventDefault()
          document.execCommand("italic")
          break
        case "u":
          e.preventDefault()
          document.execCommand("underline")
          break
        case "s":
          e.preventDefault()
          break
      }
    }
  }

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {selectedText && (
        <div className="px-4 py-2 bg-blue-50 border-b text-sm text-blue-700">
          <span className="font-medium">Selected:</span> {selectedText.substring(0, 50)}
          {selectedText.length > 50 && "..."}
        </div>
      )}

      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        spellCheck={preferences.spellCheck}
        className="flex-1 p-4 md:p-6 focus:outline-none text-foreground bg-background overflow-auto transition-all duration-200"
        style={{
          fontSize:
            note.formatting?.fontSize === "small" ? "14px" : note.formatting?.fontSize === "large" ? "18px" : "16px",
          textAlign: note.formatting?.alignment || preferences.defaultAlignment,
          lineHeight: "1.6",
          minHeight: "100%",
          whiteSpace: preferences.wordWrap ? "pre-wrap" : "pre",
          wordWrap: preferences.wordWrap ? "break-word" : "normal",
        }}
        suppressContentEditableWarning={true}
        data-placeholder="Start writing your note..."
      />

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: hsl(var(--muted-foreground));
          pointer-events: none;
        }
      `}</style>
    </div>
  )
}
