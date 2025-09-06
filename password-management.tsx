"use client"

import { useState } from "react"
import bcrypt from "bcryptjs"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PasswordDialog } from "@/components/password-dialog"
import type { Note } from "@/types/note"
import { Lock, Unlock, Shield, Key } from "lucide-react"

interface PasswordManagementProps {
  note: Note
  onUpdate: (updatedNote: Note) => void
}

export function PasswordManagement({ note, onUpdate }: PasswordManagementProps) {
  const [showProtectDialog, setShowProtectDialog] = useState(false)
  const [showChangeDialog, setShowChangeDialog] = useState(false)
  const [showUnlockDialog, setShowUnlockDialog] = useState(false)

  const handleProtect = (password: string) => {
    const hash = bcrypt.hashSync(password, 10)
    onUpdate({
      ...note,
      isPasswordProtected: true,
      passwordHash: hash,
      isUnlocked: false,
    })
    setShowProtectDialog(false)
  }

  const handleChangePassword = (password: string) => {
    const hash = bcrypt.hashSync(password, 10)
    onUpdate({ ...note, passwordHash: hash })
    setShowChangeDialog(false)
  }

  const handleUnprotect = () => {
    const confirm = window.confirm("Remove password protection from this note?")
    if (confirm) {
      onUpdate({
        ...note,
        isPasswordProtected: false,
        passwordHash: undefined,
        isUnlocked: true,
      })
    }
  }

  const handleUnlock = (enteredPassword: string) => {
    if (note.passwordHash && bcrypt.compareSync(enteredPassword, note.passwordHash)) {
      onUpdate({ ...note, isUnlocked: true, lastUnlockedAt: new Date() })
      setShowUnlockDialog(false)
    } else {
      alert("❌ Incorrect password")
    }
  }

  return (
    <>
      <DropdownMenu>
        {/* ✅ fix hydration error */}
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            {note.isPasswordProtected ? (
              <Lock className="w-4 h-4 mr-2" />
            ) : (
              <Shield className="w-4 h-4 mr-2" />
            )}
            {note.isPasswordProtected ? "Protected" : "Security"}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          {note.isPasswordProtected ? (
            <>
              {!note.isUnlocked && (
                <DropdownMenuItem onClick={() => setShowUnlockDialog(true)}>
                  <Unlock className="w-4 h-4 mr-2" />
                  Unlock Note
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => setShowChangeDialog(true)}>
                <Key className="w-4 h-4 mr-2" />
                Change Password
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleUnprotect} className="text-destructive">
                <Unlock className="w-4 h-4 mr-2" />
                Remove Protection
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem onClick={() => setShowProtectDialog(true)}>
              <Lock className="w-4 h-4 mr-2" />
              Protect with Password
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Protect Dialog */}
      <PasswordDialog
        isOpen={showProtectDialog}
        onClose={() => setShowProtectDialog(false)}
        onSubmit={handleProtect}
        title="Protect Note"
        description="Set a password to protect this note."
      />

      {/* Change Password Dialog */}
      <PasswordDialog
        isOpen={showChangeDialog}
        onClose={() => setShowChangeDialog(false)}
        onSubmit={handleChangePassword}
        title="Change Password"
        description="Enter a new password for this note."
      />

      {/* Unlock Dialog */}
      <PasswordDialog
        isOpen={showUnlockDialog}
        onClose={() => setShowUnlockDialog(false)}
        onSubmit={handleUnlock}
        title="Unlock Note"
        description="Enter the password to unlock this note."
      />
    </>
  )
}
