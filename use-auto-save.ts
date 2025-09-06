"use client"

import { useEffect, useRef } from "react"
import { storageService } from "@/lib/storage"
import type { Note } from "@/types/note"

interface UseAutoSaveProps {
  notes: Note[]
  isEnabled: boolean
  interval: number // in seconds
  onSave?: () => void
  onError?: (error: string) => void
}

export function useAutoSave({ notes, isEnabled, interval, onSave, onError }: UseAutoSaveProps) {
  const intervalRef = useRef<NodeJS.Timeout>()
  const lastSavedRef = useRef<string>("")

  useEffect(() => {
    if (!isEnabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      return
    }

    intervalRef.current = setInterval(() => {
      const currentData = JSON.stringify(notes)

      // Only save if data has changed
      if (currentData !== lastSavedRef.current) {
        const success = storageService.saveNotes(notes)

        if (success) {
          lastSavedRef.current = currentData
          onSave?.()
        } else {
          onError?.("Failed to auto-save notes")
        }
      }
    }, interval * 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [notes, isEnabled, interval, onSave, onError])

  // Manual save function
  const saveNow = () => {
    const success = storageService.saveNotes(notes)
    if (success) {
      lastSavedRef.current = JSON.stringify(notes)
      onSave?.()
    } else {
      onError?.("Failed to save notes")
    }
    return success
  }

  return { saveNow }
}
