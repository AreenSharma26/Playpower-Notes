"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PasswordDialog } from "@/components/password-dialog"
import type { Note } from "@/types/note"
import { Lock, Shield, Eye } from "lucide-react"

interface ProtectedNoteViewProps {
  note: Note
  onUnlock: (password: string) => void
  error?: string
}

export function ProtectedNoteView({ note, onUnlock, error }: ProtectedNoteViewProps) {
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [hasAttemptedUnlock, setHasAttemptedUnlock] = useState(false)

  const handleUnlock = async (password: string) => {
    setIsUnlocking(true)
    setShowSuccess(false)
    setHasAttemptedUnlock(true)
    try {
      onUnlock(password)
      // Don't close dialog here - let the parent component handle success/failure
      // The dialog will close automatically when the note becomes unlocked
    } catch (err) {
      console.error("Unlock failed:", err)
    } finally {
      setIsUnlocking(false)
    }
  }

  // Close dialog when note becomes unlocked (no error and unlock was attempted)
  useEffect(() => {
    if (showPasswordDialog && !error && !isUnlocking && hasAttemptedUnlock) {
      // Show success message briefly before closing
      setShowSuccess(true)
      setTimeout(() => {
        setShowPasswordDialog(false)
        setShowSuccess(false)
        setHasAttemptedUnlock(false)
      }, 1000)
    }
  }, [error, showPasswordDialog, isUnlocking, hasAttemptedUnlock])

  // Reset attempt flag when dialog opens
  useEffect(() => {
    if (showPasswordDialog) {
      setHasAttemptedUnlock(false)
    }
  }, [showPasswordDialog])

  return (
    <div className="flex items-center justify-center h-full p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="flex items-center justify-center gap-2">
            <Lock className="w-5 h-5" />
            Protected Note
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <div>
            <h3 className="font-semibold text-lg mb-2">{note.title}</h3>
            <p className="text-muted-foreground text-sm">
              This note is password protected. Enter the correct password to view its contents.
            </p>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Created: {new Date(note.createdAt).toLocaleDateString()}</p>
            <p>Last modified: {new Date(note.updatedAt).toLocaleDateString()}</p>
            {note.tags.length > 0 && <p>Tags: {note.tags.join(", ")}</p>}
          </div>

          <Button onClick={() => setShowPasswordDialog(true)} className="w-full">
            <Eye className="w-4 h-4 mr-2" />
            Unlock Note
          </Button>

          <PasswordDialog
            isOpen={showPasswordDialog}
            onClose={() => setShowPasswordDialog(false)}
            onSubmit={handleUnlock}
            title="Unlock Note"
            description="Enter the password to access this protected note."
            isVerification={true}
            error={error}
            isLoading={isUnlocking}
            success={showSuccess}
          />
        </CardContent>
      </Card>
    </div>
  )
}
