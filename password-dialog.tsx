"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock, Unlock, Eye, EyeOff } from "lucide-react"

interface PasswordDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (password: string) => void
  title: string
  description: string
  isVerification?: boolean
  error?: string
  isLoading?: boolean
  success?: boolean
}

export function PasswordDialog({
  isOpen,
  onClose,
  onSubmit,
  title,
  description,
  isVerification = false,
  error,
  isLoading = false,
  success = false,
}: PasswordDialogProps) {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Prevent empty password submission
    if (!password.trim()) {
      return
    }

    if (!isVerification && password !== confirmPassword) {
      return
    }

    // For verification (unlocking), allow any password length (but not empty)
    // For protection (setting password), require minimum 8 characters
    if (!isVerification && password.length < 8) {
      return
    }

    // Don't clear the form or close dialog - let the parent handle success/failure
    onSubmit(password)
  }

  const handleClose = () => {
    setPassword("")
    setConfirmPassword("")
    onClose()
  }

  // Clear form when dialog closes successfully (no error)
  useEffect(() => {
    if (!isOpen && !error) {
      setPassword("")
      setConfirmPassword("")
    }
  }, [isOpen, error])

  const passwordsMatch = isVerification || password === confirmPassword
  const isValid = isVerification ? password.trim().length >= 1 : (password.length >= 8 && passwordsMatch)

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md rounded-lg p-6 shadow-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <Lock className="w-5 h-5 text-primary" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <p className="text-base text-gray-700">{description}</p>

          {error && (
            <Alert variant="destructive" className="rounded-md">
              <AlertDescription>
                {error === "Invalid password" ? "❌ Incorrect password. Please try again." : error}
              </AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="rounded-md border-green-200 bg-green-50 text-green-800">
              <AlertDescription>✅ Password correct! Unlocking note...</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <Label htmlFor="password" className="font-medium text-gray-900">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (min 8 characters)"
                className="pr-10 rounded-md border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary"
                autoFocus
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {!isVerification && (
            <div className="space-y-4">
              <Label htmlFor="confirm-password" className="font-medium text-gray-900">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="pr-10 rounded-md border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              {password && confirmPassword && password !== confirmPassword && (
                <p className="text-sm text-destructive">Passwords do not match</p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-6">
            <Button type="button" variant="outline" onClick={handleClose} className="rounded-md px-4 py-2">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isLoading}
              className="rounded-md px-4 py-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {isVerification ? "Unlocking..." : "Protecting..."}
                </>
              ) : (
                <>
                  {isVerification ? <Unlock className="w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                  {isVerification ? "Unlock" : "Protect"}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
