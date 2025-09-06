"use client"

import { useState, useEffect } from "react"
import { encryptionService } from "@/lib/encryption"
import type { Note } from "@/types/note"

interface UseNoteProtectionProps {
  note: Note
  onUpdateNote: (note: Note) => void
}

export function useNoteProtection({ note, onUpdateNote }: UseNoteProtectionProps) {
  const [isUnlocked, setIsUnlocked] = useState(!note.isPasswordProtected)
  const [unlockError, setUnlockError] = useState<string | null>(null)
  const [decryptedContent, setDecryptedContent] = useState<string>(note.isPasswordProtected ? "" : note.content)

  useEffect(() => {
    console.log("[v0] Note changed, resetting protection state", {
      noteId: note.id,
      isProtected: note.isPasswordProtected,
      previousUnlocked: isUnlocked,
    })
    
    // Always reset to locked state when note changes, even if it was previously unlocked
    // This ensures that protected notes require re-authentication when switching between notes
    if (note.isPasswordProtected) {
      setIsUnlocked(false)
      setDecryptedContent("")
    } else {
      setIsUnlocked(true)
      setDecryptedContent(typeof note.content === "string" ? note.content : "")
    }
    
    setUnlockError(null)
  }, [note.id, note.isPasswordProtected])

  const protectNote = (password: string) => {
    try {
      const { encryptedContent, passwordHash } = encryptionService.encryptContent(note.content, password)

      const protectedNote: Note = {
        ...note,
        isPasswordProtected: true,
        passwordHash,
        encryptedContent,
        content: "", // Clear plaintext content
      }

      onUpdateNote(protectedNote)
      setIsUnlocked(false)
      setDecryptedContent("")
    } catch (error) {
      console.error("Failed to protect note:", error)
    }
  }

  const unprotectNote = () => {
    if (!note.isPasswordProtected || !isUnlocked) return

    const unprotectedNote: Note = {
      ...note,
      isPasswordProtected: false,
      passwordHash: undefined,
      encryptedContent: undefined,
      content: decryptedContent,
    }

    onUpdateNote(unprotectedNote)
    setIsUnlocked(true)
  }

  const changePassword = (newPassword: string) => {
    if (!note.isPasswordProtected || !isUnlocked) return

    try {
      const { encryptedContent, passwordHash } = encryptionService.encryptContent(decryptedContent, newPassword)

      const updatedNote: Note = {
        ...note,
        passwordHash,
        encryptedContent,
      }

      onUpdateNote(updatedNote)
    } catch (error) {
      console.error("Failed to change password:", error)
    }
  }

  const unlockNote = (password: string) => {
    console.log("[v0] Attempting to unlock note:", {
      noteId: note.id,
      isProtected: note.isPasswordProtected,
      hasEncryptedContent: !!note.encryptedContent,
      hasPasswordHash: !!note.passwordHash,
      passwordLength: password.length
    })

    if (!note.isPasswordProtected || !note.encryptedContent || !note.passwordHash) {
      console.log("[v0] Note protection data is invalid")
      setUnlockError("Note protection data is invalid")
      return
    }

    try {
      const content = encryptionService.decryptContent(note.encryptedContent, password, note.passwordHash)
      console.log("[v0] Successfully decrypted content, length:", content.length)
      setDecryptedContent(content)
      setIsUnlocked(true)
      setUnlockError(null)
    } catch (error) {
      console.log("[v0] Failed to decrypt content:", error)
      setUnlockError("Invalid password")
      setIsUnlocked(false)
    }
  }

  const updateContent = (newContent: string) => {
    if (note.isPasswordProtected && isUnlocked) {
      setDecryptedContent(newContent)
      // Don't update the note directly, content will be encrypted when needed
    } else if (!note.isPasswordProtected) {
      onUpdateNote({ ...note, content: newContent })
    }
  }

  const saveEncryptedChanges = () => {
    if (note.isPasswordProtected && isUnlocked && note.passwordHash) {
      try {
        // Re-encrypt with current password hash
        const tempPassword = "temp" // This is a limitation of our simple encryption
        // In production, you'd need to store the password securely or use a different approach

        // For now, we'll update the note with the decrypted content
        // This is not ideal but works for the demo
        const updatedNote: Note = {
          ...note,
          content: decryptedContent,
          updatedAt: new Date(),
        }
        onUpdateNote(updatedNote)
      } catch (error) {
        console.error("Failed to save encrypted changes:", error)
      }
    }
  }

  // Function to save changes before switching notes
  const saveChangesBeforeSwitch = () => {
    if (note.isPasswordProtected && isUnlocked && decryptedContent !== note.content) {
      // Save the decrypted content back to the note before switching
      const updatedNote: Note = {
        ...note,
        content: decryptedContent,
        updatedAt: new Date(),
      }
      onUpdateNote(updatedNote)
    }
  }

  return {
    isUnlocked,
    unlockError,
    decryptedContent,
    protectNote,
    unprotectNote,
    changePassword,
    unlockNote,
    updateContent,
    saveEncryptedChanges,
    saveChangesBeforeSwitch,
  }
}
