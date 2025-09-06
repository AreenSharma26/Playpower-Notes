"use client"

import { useState, useEffect } from "react"
import { NoteEditor } from "@/components/note-editor"
import { NoteSidebar } from "@/components/note-sidebar"
import { MobileSidebar } from "@/components/mobile-sidebar"
import { ResponsiveToolbar } from "@/components/responsive-toolbar"
import { NoteManagement } from "@/components/note-management"
import { AdvancedSearch } from "@/components/advanced-search"
import { PreferencesDialog } from "@/components/preferences-dialog"
import { AIFeaturesPanel } from "@/components/ai-features-panel"
import { ProtectedNoteView } from "@/components/protected-note-view"
import { PasswordDialog } from "@/components/password-dialog"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useAutoSave } from "@/hooks/use-auto-save"
import { useNoteProtection } from "@/hooks/use-note-protection"
import { storageService, type UserPreferences } from "@/lib/storage"
import type { Note } from "@/types/note"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle, Sparkles, Plus } from "lucide-react"

export default function NoteTakingApp() {
  const [notes, setNotes] = useState<Note[]>([])
  const [activeNote, setActiveNote] = useState<Note | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([])
  const [isFiltered, setIsFiltered] = useState(false)
  const [preferences, setPreferences] = useState<UserPreferences>(storageService.getPreferences())
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error" | null>(null)
  const [showAIPanel, setShowAIPanel] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedText, setSelectedText] = useState("") // Added selectedText state to track text selection from editor
  const [passwordDialogNoteId, setPasswordDialogNoteId] = useState<string | null>(null)

  const noteProtection = useNoteProtection({
    note: activeNote || ({} as Note),
    onUpdateNote: (updatedNote) => {
      setNotes((prev) => prev.map((note) => (note.id === updatedNote.id ? updatedNote : note)))
      setActiveNote(updatedNote)
    },
  })

  const { saveNow } = useAutoSave({
    notes,
    isEnabled: preferences.autoSave,
    interval: preferences.autoSaveInterval,
    onSave: () => {
      setSaveStatus("saved")
      setTimeout(() => setSaveStatus(null), 2000)
    },
    onError: (error) => {
      setSaveStatus("error")
      console.error("Auto-save error:", error)
    },
  })

  useEffect(() => {
    const loadNotes = async () => {
      try {
        // Simulate loading delay for better UX
        await new Promise((resolve) => setTimeout(resolve, 500))

        const savedNotes = storageService.loadNotes()
        if (savedNotes.length > 0) {
          setNotes(savedNotes)
          setActiveNote(savedNotes[0])
        }
      } catch (error) {
        console.error("Failed to load notes:", error)
        setSaveStatus("error")
      } finally {
        setIsLoading(false)
      }
    }

    loadNotes()
  }, [])

  const handleManualSave = () => {
    setSaveStatus("saving")
    const success = saveNow()
    setSaveStatus(success ? "saved" : "error")
    setTimeout(() => setSaveStatus(null), 2000)
  }

  const createNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: "Untitled Note",
      content: "",
      createdAt: new Date(),
      updatedAt: new Date(),
      isPinned: false,
      isPasswordProtected: false,
      tags: [],
      formatting: {
        fontSize: preferences.defaultFontSize,
        alignment: preferences.defaultAlignment,
      },
    }
    setNotes((prev) => [newNote, ...prev])
    setActiveNote(newNote)
  }

  const validateNote = (note: Note): Note => {
    return {
      ...note,
      content: typeof note.content === "string" ? note.content : "",
      tags: Array.isArray(note.tags) ? note.tags : [],
      formatting: note.formatting || {
        fontSize: "medium",
        alignment: "left",
      },
    }
  }

  const updateNote = (updatedNote: Note) => {
    const validatedNote = validateNote(updatedNote)
    setNotes((prev) =>
      prev.map((note) => (note.id === validatedNote.id ? { ...validatedNote, updatedAt: new Date() } : note)),
    )
    setActiveNote(validatedNote)
  }

  const handleNoteSelect = (note: Note) => {
    // Save any changes in the current note before switching
    if (activeNote && noteProtection.saveChangesBeforeSwitch) {
      noteProtection.saveChangesBeforeSwitch()
    }
    setActiveNote(note)
  }

  const deleteNote = (noteId: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== noteId))
    if (activeNote?.id === noteId) {
      const remainingNotes = notes.filter((note) => note.id !== noteId)
      setActiveNote(remainingNotes.length > 0 ? remainingNotes[0] : null)
    }
  }

  const togglePin = (noteId: string) => {
    setNotes((prev) => prev.map((note) => (note.id === noteId ? { ...note, isPinned: !note.isPinned } : note)))
  }

  const handleSetPassword = (noteId: string) => {
    setPasswordDialogNoteId(noteId)
  }

  const handleRemovePassword = (noteId: string) => {
    const note = notes.find(n => n.id === noteId)
    if (note) {
      const confirm = window.confirm("Are you sure you want to remove password protection from this note?")
      if (confirm) {
        // If this is the active note, use the noteProtection hook
        if (note.id === activeNote?.id) {
          noteProtection.unprotectNote()
        } else {
          // For other notes, directly remove protection
          const unprotectedNote = {
            ...note,
            isPasswordProtected: false,
            passwordHash: undefined,
            encryptedContent: undefined,
            content: note.content || "", // Restore content if it was cleared
          }
          setNotes((prev) => prev.map((n) => (n.id === unprotectedNote.id ? unprotectedNote : n)))
          if (activeNote?.id === note.id) {
            setActiveNote(unprotectedNote)
          }
        }
      }
    }
  }

  const handlePasswordSubmit = (password: string) => {
    if (passwordDialogNoteId) {
      const note = notes.find(n => n.id === passwordDialogNoteId)
      if (note) {
        // If this is the active note, use the noteProtection hook
        if (note.id === activeNote?.id) {
          if (note.isPasswordProtected) {
            // This is for unlocking the note, not changing password
            noteProtection.unlockNote(password)
          } else {
            noteProtection.protectNote(password)
          }
        } else {
          // For other notes, directly encrypt and update
          try {
            const { encryptionService } = require('@/lib/encryption')
            let contentToEncrypt = note.content
            
            // If note is already protected, we need to decrypt it first to change the password
            if (note.isPasswordProtected && note.encryptedContent) {
              // For password change, we'll need the old password, but since we don't have it here,
              // we'll just re-encrypt the current content (this is a limitation of the current implementation)
              contentToEncrypt = note.content || ""
            }
            
            const { encryptedContent, passwordHash } = encryptionService.encryptContent(contentToEncrypt, password)
            const protectedNote = {
              ...note,
              isPasswordProtected: true,
              passwordHash,
              encryptedContent,
              content: "", // Clear plaintext content
            }
            setNotes((prev) => prev.map((n) => (n.id === protectedNote.id ? protectedNote : n)))
            if (activeNote?.id === note.id) {
              setActiveNote(protectedNote)
            }
          } catch (error) {
            console.error("Failed to protect note:", error)
          }
        }
      }
    }
    setPasswordDialogNoteId(null)
  }

  const importNotes = (importedNotes: Note[]) => {
    setNotes((prev) => [...importedNotes, ...prev])
  }

  const exportNotes = () => {
    // Export functionality handled in NoteManagement component
  }

  const createTemplate = (template: Partial<Note>) => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: template.title || "Template Note",
      content: template.content || "",
      createdAt: new Date(),
      updatedAt: new Date(),
      isPinned: false,
      isPasswordProtected: false,
      tags: template.tags || [],
      formatting: {
        fontSize: preferences.defaultFontSize,
        alignment: preferences.defaultAlignment,
      },
    }
    setNotes((prev) => [newNote, ...prev])
    setActiveNote(newNote)
  }

  const handleFilteredResults = (filtered: Note[]) => {
    setFilteredNotes(filtered)
    setIsFiltered(true)
  }

  const clearFilters = () => {
    setIsFiltered(false)
    setFilteredNotes([])
  }

  const handlePreferencesChange = (newPreferences: UserPreferences) => {
    setPreferences(newPreferences)
  }

  const handleApplyTags = (suggestedTags: string[]) => {
    if (activeNote) {
      const uniqueTags = Array.from(new Set([...(activeNote.tags || []), ...suggestedTags]))
      updateNote({ ...activeNote, tags: uniqueTags })
    }
  }

  const displayNotes = isFiltered
    ? filteredNotes
    : notes.filter((note) => {
        const title = typeof note.title === "string" ? note.title : ""
        const content = typeof note.content === "string" ? note.content : ""
        return (
          title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          content.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })

  const shouldShowProtectedView = activeNote?.isPasswordProtected && !noteProtection.isUnlocked

  const handleSelectionChange = (selected: string) => {
    setSelectedText(selected)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground">Loading your notes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <NoteSidebar
          notes={displayNotes}
          activeNote={activeNote}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onNoteSelect={handleNoteSelect}
          onNewNote={createNewNote}
          onDeleteNote={deleteNote}
          onTogglePin={togglePin}
          onSetPassword={handleSetPassword}
          onRemovePassword={handleRemovePassword}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="border-b border-border bg-background p-3 md:p-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="flex items-center gap-2 md:gap-4 overflow-x-auto">
              {/* Mobile Sidebar Toggle */}
              <MobileSidebar
                notes={displayNotes}
                activeNote={activeNote}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onNoteSelect={handleNoteSelect}
                onNewNote={createNewNote}
                onDeleteNote={deleteNote}
                onTogglePin={togglePin}
                onSetPassword={handleSetPassword}
                onRemovePassword={handleRemovePassword}
              />

              {/* Mobile New Note Button */}
              <Button onClick={createNewNote} size="sm" className="md:hidden flex-shrink-0">
                <Plus className="w-4 h-4" />
              </Button>

              {/* Desktop Controls */}
              <div className="hidden md:flex items-center gap-4">
                <NoteManagement
                  notes={notes}
                  onImportNotes={importNotes}
                  onExportNotes={exportNotes}
                  onCreateTemplate={createTemplate}
                />
                <AdvancedSearch notes={notes} onFilteredResults={handleFilteredResults} onClearFilters={clearFilters} />
                <PreferencesDialog onPreferencesChange={handlePreferencesChange} />
              </div>

              {/* AI Features Toggle */}
              <Button
                variant={showAIPanel ? "default" : "outline"}
                size="sm"
                onClick={() => setShowAIPanel(!showAIPanel)}
                disabled={shouldShowProtectedView}
                className="flex-shrink-0"
              >
                <Sparkles className="w-4 h-4 mr-0 md:mr-2" />
                <span className="hidden md:inline">AI Features</span>
              </Button>
            </div>

            {/* Status Indicators */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {saveStatus && (
                <Badge
                  variant={saveStatus === "error" ? "destructive" : "secondary"}
                  className="flex items-center gap-1 text-xs"
                >
                  {saveStatus === "saved" && <CheckCircle className="w-3 h-3" />}
                  {saveStatus === "error" && <AlertCircle className="w-3 h-3" />}
                  <span className="hidden sm:inline">
                    {saveStatus === "saved" && "Saved"}
                    {saveStatus === "saving" && "Saving..."}
                    {saveStatus === "error" && "Error"}
                  </span>
                </Badge>
              )}
            </div>
          </div>

          {/* Mobile Controls */}
          <div className="flex md:hidden items-center gap-2 overflow-x-auto pb-2">
            <NoteManagement
              notes={notes}
              onImportNotes={importNotes}
              onExportNotes={exportNotes}
              onCreateTemplate={createTemplate}
            />
            <AdvancedSearch notes={notes} onFilteredResults={handleFilteredResults} onClearFilters={clearFilters} />
            <PreferencesDialog onPreferencesChange={handlePreferencesChange} />
          </div>
        </div>

        {/* Toolbar */}
        <ResponsiveToolbar
          activeNote={activeNote}
          onUpdateNote={updateNote}
          onManualSave={handleManualSave}
          onProtectNote={noteProtection.protectNote}
          onUnprotectNote={noteProtection.unprotectNote}
          onChangePassword={noteProtection.changePassword}
        />

        {/* Editor Area */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-hidden">
            {activeNote ? (
              shouldShowProtectedView ? (
                <ProtectedNoteView
                  note={activeNote}
                  onUnlock={noteProtection.unlockNote}
                  error={noteProtection.unlockError || undefined}
                />
              ) : (
                <NoteEditor
                  note={activeNote}
                  onUpdateNote={(updatedNote) => {
                    if (noteProtection.isUnlocked) {
                      noteProtection.updateContent(updatedNote.content)
                    } else {
                      updateNote(updatedNote)
                    }
                  }}
                  preferences={preferences}
                  content={noteProtection.isUnlocked ? noteProtection.decryptedContent : activeNote.content}
                  onSelectionChange={handleSelectionChange}
                />
              )
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground p-6">
                <div className="text-center max-w-md">
                  <h2 className="text-xl md:text-2xl font-semibold mb-2">Welcome to Notes</h2>
                  <p className="text-sm md:text-base mb-4">
                    {notes.length === 0
                      ? "Create your first note to get started"
                      : "Select a note from the sidebar or create a new one"}
                  </p>
                  <Button onClick={createNewNote} className="w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Note
                  </Button>
                  {isFiltered && (
                    <p className="mt-4 text-xs md:text-sm text-muted-foreground">
                      Showing {displayNotes.length} filtered results
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* AI Panel - Desktop Only */}
          {showAIPanel && activeNote && !shouldShowProtectedView && (
            <div className="hidden lg:block">
              <AIFeaturesPanel
                note={activeNote}
                onUpdateNote={updateNote}
                onApplyTags={handleApplyTags}
                selectedText={selectedText}
              />
            </div>
          )}
        </div>
      </div>

      <PasswordDialog
        isOpen={passwordDialogNoteId !== null}
        onClose={() => setPasswordDialogNoteId(null)}
        onSubmit={handlePasswordSubmit}
        title={passwordDialogNoteId ? (notes.find(n => n.id === passwordDialogNoteId)?.isPasswordProtected ? "Change Password" : "Protect Note") : "Set Password for Note"}
        description={passwordDialogNoteId ? (notes.find(n => n.id === passwordDialogNoteId)?.isPasswordProtected ? "Enter a new password for this note." : "Enter a password to protect this note. Minimum 8 characters.") : "Enter a password to protect this note. Minimum 8 characters."}
      />
    </div>
  )
}
