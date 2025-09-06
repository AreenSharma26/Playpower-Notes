"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  aiService,
  type GrammarCheck,
  type TagSuggestion,
  type Summary,
  type Translation,
  type AIInsights,
} from "@/lib/ai-service"
import type { Note } from "@/types/note"
import {
  Sparkles,
  CheckCircle,
  Tag,
  FileText,
  Languages,
  Lightbulb,
  Loader2,
  Copy,
  Check,
  MousePointer,
} from "lucide-react"

interface AIFeaturesPanelProps {
  note: Note
  onUpdateNote: (note: Note) => void
  onApplyTags: (tags: string[]) => void
  selectedText?: string // Added selectedText prop
}

export function AIFeaturesPanel({ note, onUpdateNote, onApplyTags, selectedText }: AIFeaturesPanelProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [grammarCheck, setGrammarCheck] = useState<GrammarCheck | null>(null)
  const [tagSuggestions, setTagSuggestions] = useState<TagSuggestion | null>(null)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [translation, setTranslation] = useState<Translation | null>(null)
  const [insights, setInsights] = useState<AIInsights | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState("spanish")
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({})

  const languages = [
    { code: "spanish", name: "Spanish" },
    { code: "french", name: "French" },
    { code: "german", name: "German" },
    { code: "italian", name: "Italian" },
    { code: "portuguese", name: "Portuguese" },
    { code: "chinese", name: "Chinese" },
    { code: "japanese", name: "Japanese" },
    { code: "korean", name: "Korean" },
    { code: "arabic", name: "Arabic" },
    { code: "russian", name: "Russian" },
  ]

  const getContentForProcessing = () => {
    return selectedText && selectedText.trim() ? selectedText.trim() : note.content
  }

  const isUsingSelectedText = () => {
    return selectedText && selectedText.trim().length > 0
  }

  const handleGrammarCheck = async () => {
    setIsLoading("grammar")
    try {
      const content = getContentForProcessing() // Use selected text or full content
      const result = await aiService.checkGrammar(content)
      setGrammarCheck(result)
    } catch (error) {
      console.error("Grammar check failed:", error)
    } finally {
      setIsLoading(null)
    }
  }

  const handleTagSuggestion = async () => {
    setIsLoading("tags")
    try {
      const content = getContentForProcessing() // Use selected text or full content
      const result = await aiService.suggestTags(content)
      setTagSuggestions(result)
    } catch (error) {
      console.error("Tag suggestion failed:", error)
    } finally {
      setIsLoading(null)
    }
  }

  const handleSummarize = async () => {
    setIsLoading("summary")
    try {
      const content = getContentForProcessing() // Use selected text or full content
      const result = await aiService.summarizeText(content)
      setSummary(result)
    } catch (error) {
      console.error("Summarization failed:", error)
    } finally {
      setIsLoading(null)
    }
  }

  const handleTranslate = async () => {
    setIsLoading("translate")
    try {
      const content = getContentForProcessing() // Use selected text or full content
      const result = await aiService.translateText(content, selectedLanguage)
      setTranslation(result)
    } catch (error) {
      console.error("Translation failed:", error)
    } finally {
      setIsLoading(null)
    }
  }

  const handleInsights = async () => {
    setIsLoading("insights")
    try {
      const content = getContentForProcessing() // Use selected text or full content
      const result = await aiService.generateInsights(content)
      setInsights(result)
    } catch (error) {
      console.error("Insights generation failed:", error)
    } finally {
      setIsLoading(null)
    }
  }

  const handleHighlightGlossary = async () => {
    setIsLoading("glossary")
    try {
      const content = getContentForProcessing() // Use selected text or full content
      const highlightedContent = await aiService.highlightGlossary(content)

      if (isUsingSelectedText() && selectedText) {
        const updatedContent = note.content.replace(selectedText, highlightedContent)
        onUpdateNote({ ...note, content: updatedContent })
      } else {
        onUpdateNote({ ...note, content: highlightedContent })
      }
    } catch (error) {
      console.error("Glossary highlighting failed:", error)
    } finally {
      setIsLoading(null)
    }
  }

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedStates({ ...copiedStates, [key]: true })
      setTimeout(() => {
        setCopiedStates({ ...copiedStates, [key]: false })
      }, 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const applyCorrection = (original: string, suggestion: string) => {
    if (isUsingSelectedText() && selectedText) {
      const updatedSelection = selectedText.replace(original, suggestion)
      const updatedContent = note.content.replace(selectedText, updatedSelection)
      onUpdateNote({ ...note, content: updatedContent })
    } else {
      const updatedContent = note.content.replace(original, suggestion)
      onUpdateNote({ ...note, content: updatedContent })
    }
  }

  return (
    <div className="w-96 border-l border-border bg-background p-4 overflow-y-auto">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">AI Features</h2>
      </div>

      {isUsingSelectedText() && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-blue-700">
            <MousePointer className="w-4 h-4" />
            <span className="text-sm font-medium">Working with selected text</span>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            {selectedText!.substring(0, 60)}
            {selectedText!.length > 60 && "..."}
          </p>
        </div>
      )}

      <Tabs defaultValue="grammar" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="grammar">Check & Fix</TabsTrigger>
          <TabsTrigger value="analyze">Analyze</TabsTrigger>
        </TabsList>

        <TabsContent value="grammar" className="space-y-4">
          {/* Grammar Check */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Grammar Check
                {isUsingSelectedText() && (
                  <Badge variant="outline" className="text-xs">
                    Selection
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={handleGrammarCheck} disabled={isLoading === "grammar"} size="sm" className="w-full">
                {isLoading === "grammar" ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Check Grammar
              </Button>

              {grammarCheck && (
                <div className="space-y-2">
                  {grammarCheck.hasErrors ? (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Found {grammarCheck.corrections.length} suggestions:
                      </p>
                      <ScrollArea className="h-32">
                        {grammarCheck.corrections.map((correction, index) => (
                          <div key={index} className="p-2 border rounded text-xs space-y-1 mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {correction.type}
                              </Badge>
                            </div>
                            <p>
                              <strong>Original:</strong> {correction.original}
                            </p>
                            <p>
                              <strong>Suggestion:</strong> {correction.suggestion}
                            </p>
                            <p className="text-muted-foreground">{correction.explanation}</p>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => applyCorrection(correction.original, correction.suggestion)}
                              className="w-full"
                            >
                              Apply Fix
                            </Button>
                          </div>
                        ))}
                      </ScrollArea>
                    </div>
                  ) : (
                    <p className="text-sm text-green-600">No grammar issues found!</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Glossary Highlighting */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Highlight Key Terms
                {isUsingSelectedText() && (
                  <Badge variant="outline" className="text-xs">
                    Selection
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleHighlightGlossary}
                disabled={isLoading === "glossary"}
                size="sm"
                className="w-full"
              >
                {isLoading === "glossary" ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                Highlight Terms
              </Button>
            </CardContent>
          </Card>

          {/* Translation */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Languages className="w-4 h-4" />
                Translate
                {isUsingSelectedText() && (
                  <Badge variant="outline" className="text-xs">
                    Selection
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button onClick={handleTranslate} disabled={isLoading === "translate"} size="sm" className="w-full">
                {isLoading === "translate" ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Languages className="w-4 h-4 mr-2" />
                )}
                Translate
              </Button>

              {translation && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Translation:</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(translation.translatedText, "translation")}
                    >
                      {copiedStates.translation ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </Button>
                  </div>
                  <ScrollArea className="h-24 p-2 border rounded text-sm">{translation.translatedText}</ScrollArea>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analyze" className="space-y-4">
          {/* Tag Suggestions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Tag Suggestions
                {isUsingSelectedText() && (
                  <Badge variant="outline" className="text-xs">
                    Selection
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={handleTagSuggestion} disabled={isLoading === "tags"} size="sm" className="w-full">
                {isLoading === "tags" ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Tag className="w-4 h-4 mr-2" />
                )}
                Suggest Tags
              </Button>

              {tagSuggestions && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Confidence: {Math.round(tagSuggestions.confidence * 100)}%
                    </p>
                    <Button size="sm" variant="outline" onClick={() => onApplyTags(tagSuggestions.tags)}>
                      Apply All
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {tagSuggestions.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Summary
                {isUsingSelectedText() && (
                  <Badge variant="outline" className="text-xs">
                    Selection
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={handleSummarize} disabled={isLoading === "summary"} size="sm" className="w-full">
                {isLoading === "summary" ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <FileText className="w-4 h-4 mr-2" />
                )}
                Summarize
              </Button>

              {summary && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Summary:</p>
                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(summary.summary, "summary")}>
                      {copiedStates.summary ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </Button>
                  </div>
                  <p className="text-sm p-2 border rounded">{summary.summary}</p>

                  <div>
                    <p className="text-sm font-medium mb-2">Key Points:</p>
                    <ul className="text-sm space-y-1">
                      {summary.keyPoints.map((point, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                AI Insights
                {isUsingSelectedText() && (
                  <Badge variant="outline" className="text-xs">
                    Selection
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={handleInsights} disabled={isLoading === "insights"} size="sm" className="w-full">
                {isLoading === "insights" ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Lightbulb className="w-4 h-4 mr-2" />
                )}
                Generate Insights
              </Button>

              {insights && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={
                        insights.sentiment === "positive"
                          ? "default"
                          : insights.sentiment === "negative"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {insights.sentiment}
                    </Badge>
                    <div className="text-sm">Readability: {insights.readabilityScore}/100</div>
                  </div>

                  <Progress value={insights.readabilityScore} className="h-2" />

                  <div>
                    <p className="text-sm font-medium mb-2">Insights:</p>
                    <ul className="text-sm space-y-1">
                      {insights.insights.map((insight, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Lightbulb className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Recommendations:</p>
                    <ul className="text-sm space-y-1">
                      {insights.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
