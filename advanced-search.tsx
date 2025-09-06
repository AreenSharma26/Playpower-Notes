"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import type { Note } from "@/types/note"
import { Filter, X } from "lucide-react"

interface AdvancedSearchProps {
  notes: Note[]
  onFilteredResults: (notes: Note[]) => void
  onClearFilters: () => void
}

interface SearchFilters {
  query: string
  tags: string[]
  dateRange: "all" | "today" | "week" | "month"
  isPinned?: boolean
  isPasswordProtected?: boolean
}

export function AdvancedSearch({ notes, onFilteredResults, onClearFilters }: AdvancedSearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    tags: [],
    dateRange: "all",
  })

  const allTags = Array.from(new Set(notes.flatMap((note) => note.tags)))

  const applyFilters = () => {
    let filtered = notes

    // Text search
    if (filters.query) {
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(filters.query.toLowerCase()) ||
          note.content.toLowerCase().includes(filters.query.toLowerCase()),
      )
    }

    // Tag filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter((note) => filters.tags.some((tag) => note.tags.includes(tag)))
    }

    // Date range filter
    if (filters.dateRange !== "all") {
      const now = new Date()
      const filterDate = new Date()

      switch (filters.dateRange) {
        case "today":
          filterDate.setHours(0, 0, 0, 0)
          break
        case "week":
          filterDate.setDate(now.getDate() - 7)
          break
        case "month":
          filterDate.setMonth(now.getMonth() - 1)
          break
      }

      filtered = filtered.filter((note) => new Date(note.updatedAt) >= filterDate)
    }

    // Pin filter
    if (filters.isPinned !== undefined) {
      filtered = filtered.filter((note) => note.isPinned === filters.isPinned)
    }

    // Password protection filter
    if (filters.isPasswordProtected !== undefined) {
      filtered = filtered.filter((note) => note.isPasswordProtected === filters.isPasswordProtected)
    }

    onFilteredResults(filtered)
    setIsOpen(false)
  }

  const clearFilters = () => {
    setFilters({
      query: "",
      tags: [],
      dateRange: "all",
    })
    onClearFilters()
  }

  const toggleTag = (tag: string) => {
    setFilters((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }))
  }

  const hasActiveFilters =
    filters.query ||
    filters.tags.length > 0 ||
    filters.dateRange !== "all" ||
    filters.isPinned !== undefined ||
    filters.isPasswordProtected !== undefined

  return (
    <div className="flex items-center gap-2">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Advanced Search
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2 px-1 py-0 text-xs">
                Active
              </Badge>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Advanced Search & Filter</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="search-query">Search Text</Label>
              <Input
                id="search-query"
                value={filters.query}
                onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                placeholder="Search in title and content..."
              />
            </div>

            <div>
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {allTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={filters.tags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="date-range">Date Range</Label>
              <Select
                value={filters.dateRange}
                onValueChange={(value: any) => setFilters({ ...filters, dateRange: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Note Properties</Label>
              <div className="flex gap-2">
                <Button
                  variant={filters.isPinned === true ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilters({ ...filters, isPinned: filters.isPinned === true ? undefined : true })}
                >
                  Pinned Only
                </Button>
                <Button
                  variant={filters.isPasswordProtected === true ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setFilters({
                      ...filters,
                      isPasswordProtected: filters.isPasswordProtected === true ? undefined : true,
                    })
                  }
                >
                  Protected Only
                </Button>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={applyFilters} className="flex-1">
                Apply Filters
              </Button>
              <Button variant="outline" onClick={clearFilters}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
