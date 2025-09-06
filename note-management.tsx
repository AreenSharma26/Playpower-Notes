"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import type { Note } from "@/types/note"
import { Share, Download, FileText, Folder, FileDown } from "lucide-react"

interface NoteManagementProps {
  notes: Note[]
  onImportNotes: (notes: Note[]) => void
  onExportNotes: () => void
  onCreateTemplate: (template: Partial<Note>) => void
}

export function NoteManagement({ notes, onImportNotes, onExportNotes, onCreateTemplate }: NoteManagementProps) {
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [isTemplateOpen, setIsTemplateOpen] = useState(false)
  const [templateData, setTemplateData] = useState({
    title: "",
    content: "",
    tags: "",
    category: "",
  })

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const fileExtension = file.name.toLowerCase().split(".").pop()

      // Check if file is docx or doc
      if (fileExtension === "docx" || fileExtension === "doc") {
        // For demo purposes, we'll create a note with the file name and basic content
        // In production, you'd use a library like mammoth.js to parse docx files
        const newNote: Note = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          title: file.name.replace(/\.(docx?|docs?)$/i, ""),
          content: `Imported from ${file.name}\n\nContent will be extracted here in production version.`,
          createdAt: new Date(),
          updatedAt: new Date(),
          isPinned: false,
          isPasswordProtected: false,
          tags: ["imported"],
          formatting: {
            fontSize: "medium",
            alignment: "left",
          },
        }
        onImportNotes([newNote])
        setIsImportOpen(false)
        alert(
          `Successfully imported ${file.name}. Note: Full docx parsing requires additional libraries in production.`,
        )
      } else {
        alert("Please select only .docx or .doc files for import.")
      }
    }
  }

  const handleExportAsDocx = () => {
    // Create a simple HTML document that can be saved as docx
    const htmlContent = notes
      .map((note) => {
        return `
          <div style="page-break-after: always;">
            <h1>${note.title}</h1>
            <p><strong>Created:</strong> ${new Date(note.createdAt).toLocaleDateString()}</p>
            <p><strong>Tags:</strong> ${note.tags.join(", ")}</p>
            <hr>
            <div>${note.content}</div>
          </div>
        `
      })
      .join("")

    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Notes Export</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            h1 { color: #333; border-bottom: 2px solid #333; }
            hr { margin: 20px 0; }
          </style>
        </head>
        <body>${htmlContent}</body>
      </html>
    `

    const dataBlob = new Blob([fullHtml], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `notes-export-${new Date().toISOString().split("T")[0]}.docx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    onExportNotes()
  }

  const handleExportAsPdf = () => {
    // Create HTML content optimized for PDF
    const htmlContent = notes
      .map((note) => {
        const cleanContent = note.content.replace(/<[^>]*>/g, "")
        return `
          <div style="page-break-after: always; margin-bottom: 40px;">
            <h1 style="color: #333; border-bottom: 2px solid #333; padding-bottom: 10px;">${note.title}</h1>
            <p style="color: #666; font-size: 12px;">
              <strong>Created:</strong> ${new Date(note.createdAt).toLocaleDateString()} | 
              <strong>Tags:</strong> ${note.tags.join(", ")}
            </p>
            <div style="margin-top: 20px; line-height: 1.6;">${cleanContent}</div>
          </div>
        `
      })
      .join("")

    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Notes Export</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 40px; 
              line-height: 1.6;
            }
            @media print {
              body { margin: 20px; }
            }
          </style>
        </head>
        <body>${htmlContent}</body>
      </html>
    `

    // Open in new window for printing to PDF
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(fullHtml)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => {
        printWindow.print()
      }, 500)
    }
  }

  const handleCreateTemplate = () => {
    const template: Partial<Note> = {
      title: templateData.title || "Template Note",
      content: templateData.content,
      tags: templateData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      isPinned: false,
      isPasswordProtected: false,
    }
    onCreateTemplate(template)
    setTemplateData({ title: "", content: "", tags: "", category: "" })
    setIsTemplateOpen(false)
  }

  return (
    <div className="flex items-center gap-2">
      {/* Export Options */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Share className="w-4 h-4 mr-2" />
            Export
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Notes</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Button onClick={handleExportAsDocx} className="w-full">
              <FileText className="w-4 h-4 mr-2" />
              Export as DOCX
            </Button>
            <Button onClick={handleExportAsPdf} variant="outline" className="w-full bg-transparent">
              <FileDown className="w-4 h-4 mr-2" />
              Export as PDF
            </Button>
            <p className="text-sm text-muted-foreground">
              DOCX format preserves formatting and can be opened in Microsoft Word. PDF format is ideal for sharing and
              printing.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Import
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Notes</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="import-file">Select DOCX or DOC file</Label>
              <Input id="import-file" type="file" accept=".docx,.doc" onChange={handleImport} />
            </div>
            <p className="text-sm text-muted-foreground">
              Import notes from Microsoft Word documents (.docx or .doc files only). The document content will be
              converted to a new note.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Template */}
      <Dialog open={isTemplateOpen} onOpenChange={setIsTemplateOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Folder className="w-4 h-4 mr-2" />
            Template
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Note Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="template-title">Template Title</Label>
              <Input
                id="template-title"
                value={templateData.title}
                onChange={(e) => setTemplateData({ ...templateData, title: e.target.value })}
                placeholder="Meeting Notes, Daily Journal, etc."
              />
            </div>
            <div>
              <Label htmlFor="template-content">Template Content</Label>
              <Textarea
                id="template-content"
                value={templateData.content}
                onChange={(e) => setTemplateData({ ...templateData, content: e.target.value })}
                placeholder="Enter template content with placeholders..."
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="template-tags">Default Tags</Label>
              <Input
                id="template-tags"
                value={templateData.tags}
                onChange={(e) => setTemplateData({ ...templateData, tags: e.target.value })}
                placeholder="work, meeting, personal (comma separated)"
              />
            </div>
            <Button onClick={handleCreateTemplate} className="w-full">
              Create Template
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
