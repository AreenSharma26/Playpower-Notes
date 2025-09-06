"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { storageService, type UserPreferences } from "@/lib/storage"
import { Settings, Download, Upload, Trash2 } from "lucide-react"

interface PreferencesDialogProps {
  onPreferencesChange: (preferences: UserPreferences) => void
}

export function PreferencesDialog({ onPreferencesChange }: PreferencesDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [preferences, setPreferences] = useState<UserPreferences>(storageService.getPreferences())
  const [storageInfo, setStorageInfo] = useState({ used: 0, available: 0, percentage: 0 })

  useEffect(() => {
    if (isOpen) {
      setStorageInfo(storageService.getStorageInfo())
    }
  }, [isOpen])

  const handleSave = () => {
    const success = storageService.savePreferences(preferences)
    if (success) {
      onPreferencesChange(preferences)
      setIsOpen(false)
    } else {
      alert("Failed to save preferences")
    }
  }

  const handleBackup = () => {
    const backup = storageService.createBackup()
    if (backup) {
      const blob = new Blob([backup], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `notes-backup-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } else {
      alert("Failed to create backup")
    }
  }

  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const backupData = e.target?.result as string
        const success = storageService.restoreFromBackup(backupData)
        if (success) {
          alert("Backup restored successfully! Please refresh the page.")
        } else {
          alert("Failed to restore backup")
        }
      }
      reader.readAsText(file)
    }
  }

  const handleClearData = () => {
    const confirm = window.confirm("Are you sure you want to clear all data? This action cannot be undone.")
    if (confirm) {
      const success = storageService.clearAllData()
      if (success) {
        alert("All data cleared successfully! Please refresh the page.")
      } else {
        alert("Failed to clear data")
      }
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Application Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Auto-save Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Auto-save</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-save">Enable auto-save</Label>
              <Switch
                id="auto-save"
                checked={preferences.autoSave}
                onCheckedChange={(checked) => setPreferences({ ...preferences, autoSave: checked })}
              />
            </div>
            {preferences.autoSave && (
              <div>
                <Label htmlFor="auto-save-interval">Auto-save interval (seconds)</Label>
                <Input
                  id="auto-save-interval"
                  type="number"
                  min="10"
                  max="300"
                  value={preferences.autoSaveInterval}
                  onChange={(e) =>
                    setPreferences({ ...preferences, autoSaveInterval: Number.parseInt(e.target.value) || 30 })
                  }
                />
              </div>
            )}
          </div>

          {/* Editor Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Editor</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="default-font-size">Default font size</Label>
                <Select
                  value={preferences.defaultFontSize}
                  onValueChange={(value: any) => setPreferences({ ...preferences, defaultFontSize: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="default-alignment">Default alignment</Label>
                <Select
                  value={preferences.defaultAlignment}
                  onValueChange={(value: any) => setPreferences({ ...preferences, defaultAlignment: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="word-wrap">Word wrap</Label>
              <Switch
                id="word-wrap"
                checked={preferences.wordWrap}
                onCheckedChange={(checked) => setPreferences({ ...preferences, wordWrap: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="spell-check">Spell check</Label>
              <Switch
                id="spell-check"
                checked={preferences.spellCheck}
                onCheckedChange={(checked) => setPreferences({ ...preferences, spellCheck: checked })}
              />
            </div>
          </div>

          {/* Storage Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Storage</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Used: {formatBytes(storageInfo.used)}</span>
                <span>{storageInfo.percentage.toFixed(1)}% of available space</span>
              </div>
              <Progress value={storageInfo.percentage} className="h-2" />
              {preferences.lastBackup && (
                <p className="text-sm text-muted-foreground">
                  Last backup: {new Date(preferences.lastBackup).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {/* Data Management */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Data Management</h3>
            <div className="flex gap-2 flex-wrap">
              <Button onClick={handleBackup} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Create Backup
              </Button>

              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleRestore}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Restore Backup
                </Button>
              </div>

              <Button onClick={handleClearData} variant="destructive" size="sm">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Data
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Settings</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
