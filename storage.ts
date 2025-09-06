interface StorageData {
  notes: any[]
  preferences: UserPreferences
  version: string
}

interface UserPreferences {
  theme: "light" | "dark" | "system"
  autoSave: boolean
  autoSaveInterval: number // in seconds
  defaultFontSize: "small" | "medium" | "large"
  defaultAlignment: "left" | "center" | "right"
  showLineNumbers: boolean
  wordWrap: boolean
  spellCheck: boolean
  lastBackup?: string
}

const STORAGE_VERSION = "1.0.0"
const STORAGE_KEY = "notes-app-data"
const PREFERENCES_KEY = "notes-app-preferences"

class StorageService {
  private defaultPreferences: UserPreferences = {
    theme: "system",
    autoSave: true,
    autoSaveInterval: 30,
    defaultFontSize: "medium",
    defaultAlignment: "left",
    showLineNumbers: false,
    wordWrap: true,
    spellCheck: true,
  }

  // Check if localStorage is available
  private isStorageAvailable(): boolean {
    try {
      const test = "__storage_test__"
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  }

  // Get storage usage information
  getStorageInfo(): { used: number; available: number; percentage: number } {
    if (!this.isStorageAvailable()) {
      return { used: 0, available: 0, percentage: 0 }
    }

    let used = 0
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length
      }
    }

    // Estimate 5MB as typical localStorage limit
    const available = 5 * 1024 * 1024
    const percentage = (used / available) * 100

    return { used, available, percentage }
  }

  // Save notes with error handling and compression
  saveNotes(notes: any[]): boolean {
    if (!this.isStorageAvailable()) {
      console.warn("localStorage not available")
      return false
    }

    try {
      const data: StorageData = {
        notes,
        preferences: this.getPreferences(),
        version: STORAGE_VERSION,
      }

      const serialized = JSON.stringify(data)

      // Check if data is too large
      if (serialized.length > 4.5 * 1024 * 1024) {
        // 4.5MB limit
        console.warn("Data too large for localStorage")
        return false
      }

      localStorage.setItem(STORAGE_KEY, serialized)
      return true
    } catch (error) {
      console.error("Failed to save notes:", error)
      return false
    }
  }

  // Load notes with migration support
  loadNotes(): any[] {
    if (!this.isStorageAvailable()) {
      return []
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return []

      const data: StorageData = JSON.parse(stored)

      // Handle version migration if needed
      if (data.version !== STORAGE_VERSION) {
        return this.migrateData(data)
      }

      return Array.isArray(data.notes) ? data.notes : []
    } catch (error) {
      console.error("Failed to load notes:", error)
      return []
    }
  }

  // Save user preferences
  savePreferences(preferences: Partial<UserPreferences>): boolean {
    if (!this.isStorageAvailable()) return false

    try {
      const current = this.getPreferences()
      const updated = { ...current, ...preferences }
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated))
      return true
    } catch (error) {
      console.error("Failed to save preferences:", error)
      return false
    }
  }

  // Load user preferences
  getPreferences(): UserPreferences {
    if (!this.isStorageAvailable()) {
      return this.defaultPreferences
    }

    try {
      const stored = localStorage.getItem(PREFERENCES_KEY)
      if (!stored) return this.defaultPreferences

      const preferences = JSON.parse(stored)
      return { ...this.defaultPreferences, ...preferences }
    } catch (error) {
      console.error("Failed to load preferences:", error)
      return this.defaultPreferences
    }
  }

  // Create backup of all data
  createBackup(): string | null {
    if (!this.isStorageAvailable()) return null

    try {
      const notes = this.loadNotes()
      const preferences = this.getPreferences()

      const backup = {
        notes,
        preferences,
        version: STORAGE_VERSION,
        timestamp: new Date().toISOString(),
      }

      const backupString = JSON.stringify(backup, null, 2)

      // Update last backup time
      this.savePreferences({ lastBackup: new Date().toISOString() })

      return backupString
    } catch (error) {
      console.error("Failed to create backup:", error)
      return null
    }
  }

  // Restore from backup
  restoreFromBackup(backupData: string): boolean {
    try {
      const backup = JSON.parse(backupData)

      if (backup.notes && Array.isArray(backup.notes)) {
        this.saveNotes(backup.notes)
      }

      if (backup.preferences) {
        this.savePreferences(backup.preferences)
      }

      return true
    } catch (error) {
      console.error("Failed to restore backup:", error)
      return false
    }
  }

  // Clear all data
  clearAllData(): boolean {
    if (!this.isStorageAvailable()) return false

    try {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(PREFERENCES_KEY)
      return true
    } catch (error) {
      console.error("Failed to clear data:", error)
      return false
    }
  }

  // Migrate data from older versions
  private migrateData(data: any): any[] {
    // Handle migration logic here
    console.log("Migrating data from version", data.version, "to", STORAGE_VERSION)

    // For now, just return the notes array
    return Array.isArray(data.notes) ? data.notes : []
  }
}

export const storageService = new StorageService()
export type { UserPreferences }
