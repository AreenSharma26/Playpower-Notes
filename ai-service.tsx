import { generateText, generateObject } from "ai"
import { groq } from "@ai-sdk/groq"

interface GrammarCheck {
  hasErrors: boolean
  corrections: Array<{
    original: string
    suggestion: string
    type: "grammar" | "spelling" | "style"
    explanation: string
  }>
}

interface TagSuggestion {
  tags: string[]
  confidence: number
}

interface Summary {
  summary: string
  keyPoints: string[]
  wordCount: number
}

interface Translation {
  translatedText: string
  sourceLanguage: string
  targetLanguage: string
}

interface AIInsights {
  insights: string[]
  recommendations: string[]
  sentiment: "positive" | "neutral" | "negative"
  readabilityScore: number
}

class AIService {
  private model = groq("llama-3.1-70b-versatile")

  private validateContent(content: any): string {
    console.log("[v0] AI Service - validating content:", typeof content, content?.length || "no length")

    if (content === null || content === undefined) {
      console.log("[v0] AI Service - content is null/undefined")
      return ""
    }

    if (typeof content === "string") {
      return content
    }

    if (typeof content === "object") {
      console.log("[v0] AI Service - content is object, attempting to extract")
      // Try to extract content from object
      if (content.content && typeof content.content === "string") {
        return content.content
      }
      // If it's a stringified object, try to parse it
      try {
        const parsed = JSON.parse(content)
        if (parsed.content && typeof parsed.content === "string") {
          return parsed.content
        }
      } catch (e) {
        // Not valid JSON, convert to string
      }
      return String(content)
    }

    return String(content)
  }

  async checkGrammar(text: string): Promise<GrammarCheck> {
    try {
      const cleanText = this.stripHtml(this.validateContent(text))
      console.log("[v0] AI Service - Grammar check, clean text length:", cleanText.length)

      if (!cleanText.trim()) {
        console.log("[v0] AI Service - No content for grammar check")
        return { hasErrors: false, corrections: [] }
      }

      const { text: response } = await generateText({
        model: this.model,
        prompt: `Check the following text for grammar, spelling, and style errors. Return your response in this exact JSON format:

{
  "hasErrors": true/false,
  "corrections": [
    {
      "original": "text with error",
      "suggestion": "corrected text",
      "type": "grammar/spelling/style",
      "explanation": "explanation of the error"
    }
  ]
}

Text to check: "${cleanText}"

If no errors are found, return hasErrors: false and an empty corrections array. Only return valid JSON, no other text.`,
      })

      try {
        const parsed = JSON.parse(response)
        console.log("[v0] AI Service - Grammar check completed successfully")
        return parsed as GrammarCheck
      } catch (parseError) {
        console.error("[v0] AI Service - Failed to parse grammar check response:", parseError)
        return { hasErrors: false, corrections: [] }
      }
    } catch (error) {
      console.error("[v0] AI Service - Grammar check failed:", error)
      return { hasErrors: false, corrections: [] }
    }
  }

  async suggestTags(text: string): Promise<TagSuggestion> {
    try {
      const cleanText = this.stripHtml(this.validateContent(text))
      console.log("[v0] AI Service - Tag suggestion, clean text length:", cleanText.length)

      if (!cleanText.trim()) {
        console.log("[v0] AI Service - No content for tag suggestion")
        return { tags: [], confidence: 0 }
      }

      const { text: response } = await generateText({
        model: this.model,
        prompt: `Analyze the following text and suggest 3-7 relevant tags. Return your response in this exact JSON format:

{
  "tags": ["tag1", "tag2", "tag3"],
  "confidence": 0.85
}

Text: "${cleanText}"

Tags should be single words or short phrases, lowercase, and relevant to the main topics. Confidence should be between 0 and 1. Only return valid JSON, no other text.`,
      })

      try {
        const parsed = JSON.parse(response)
        console.log("[v0] AI Service - Tag suggestion completed successfully")
        return parsed as TagSuggestion
      } catch (parseError) {
        console.error("[v0] AI Service - Failed to parse tag suggestion response:", parseError)
        return { tags: [], confidence: 0 }
      }
    } catch (error) {
      console.error("[v0] AI Service - Tag suggestion failed:", error)
      return { tags: [], confidence: 0 }
    }
  }

  async summarizeText(text: string): Promise<Summary> {
    try {
      const cleanText = this.stripHtml(this.validateContent(text))
      console.log("[v0] AI Service - Summarization, clean text length:", cleanText.length)

      if (!cleanText.trim()) {
        console.log("[v0] AI Service - No content for summarization")
        return { summary: "", keyPoints: [], wordCount: 0 }
      }

      const wordCount = cleanText.split(/\s+/).length

      const { object } = await generateObject({
        model: this.model,
        schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            keyPoints: {
              type: "array",
              items: { type: "string" },
            },
            wordCount: { type: "number" },
          },
          required: ["summary", "keyPoints", "wordCount"],
        },
        prompt: `Summarize the following text and extract key points:

Text: "${cleanText}"

Provide:
1. A concise summary (2-3 sentences)
2. 3-5 key points as bullet points
3. Word count: ${wordCount}`,
      })

      console.log("[v0] AI Service - Summarization completed successfully")
      return { ...object, wordCount } as Summary
    } catch (error) {
      console.error("[v0] AI Service - Summarization failed:", error)
      return { summary: "", keyPoints: [], wordCount: 0 }
    }
  }

  async translateText(text: string, targetLanguage: string): Promise<Translation> {
    try {
      const cleanText = this.stripHtml(this.validateContent(text))
      console.log("[v0] AI Service - Translation, clean text length:", cleanText.length)

      if (!cleanText.trim()) {
        console.log("[v0] AI Service - No content for translation")
        return { translatedText: "", sourceLanguage: "en", targetLanguage }
      }

      const { text: translatedText } = await generateText({
        model: this.model,
        prompt: `Translate the following text to ${targetLanguage}. Maintain the original meaning and tone. Only return the translated text, nothing else.

Text to translate: "${cleanText}"`,
      })

      console.log("[v0] AI Service - Translation completed successfully")
      return {
        translatedText,
        sourceLanguage: "auto-detected",
        targetLanguage,
      }
    } catch (error) {
      console.error("[v0] AI Service - Translation failed:", error)
      return { translatedText: text, sourceLanguage: "en", targetLanguage }
    }
  }

  async generateInsights(text: string): Promise<AIInsights> {
    try {
      const cleanText = this.stripHtml(this.validateContent(text))
      console.log("[v0] AI Service - Insights generation, clean text length:", cleanText.length)

      if (!cleanText.trim()) {
        console.log("[v0] AI Service - No content for insights")
        return { insights: [], recommendations: [], sentiment: "neutral", readabilityScore: 0 }
      }

      const { object } = await generateObject({
        model: this.model,
        schema: {
          type: "object",
          properties: {
            insights: {
              type: "array",
              items: { type: "string" },
            },
            recommendations: {
              type: "array",
              items: { type: "string" },
            },
            sentiment: { type: "string", enum: ["positive", "neutral", "negative"] },
            readabilityScore: { type: "number", minimum: 0, maximum: 100 },
          },
          required: ["insights", "recommendations", "sentiment", "readabilityScore"],
        },
        prompt: `Analyze the following text and provide insights:

Text: "${cleanText}"

Provide:
1. 2-4 insights about the content, themes, or patterns
2. 2-4 recommendations for improvement or next steps
3. Overall sentiment (positive, neutral, negative)
4. Readability score (0-100, where 100 is most readable)`,
      })

      console.log("[v0] AI Service - Insights generation completed successfully")
      return object as AIInsights
    } catch (error) {
      console.error("[v0] AI Service - Insights generation failed:", error)
      return { insights: [], recommendations: [], sentiment: "neutral", readabilityScore: 0 }
    }
  }

  async highlightGlossary(text: string, glossaryTerms?: string[]): Promise<string> {
    try {
      const validatedText = this.validateContent(text)
      const cleanText = this.stripHtml(validatedText)
      console.log("[v0] AI Service - Glossary highlighting, clean text length:", cleanText.length)

      if (!cleanText.trim()) {
        console.log("[v0] AI Service - No content for glossary highlighting")
        return validatedText
      }

      // If no glossary terms provided, extract key terms from the text
      let terms = glossaryTerms
      if (!terms || terms.length === 0) {
        const { text: extractedTerms } = await generateText({
          model: this.model,
          prompt: `Extract 5-10 key technical terms, concepts, or important phrases from this text that would benefit from highlighting in a glossary. Return only the terms, separated by commas:

Text: "${cleanText}"`,
        })
        terms = extractedTerms
          .split(",")
          .map((term) => term.trim())
          .filter(Boolean)
      }

      // Highlight terms in the original HTML text
      let highlightedText = validatedText
      terms.forEach((term) => {
        const regex = new RegExp(`\\b(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})\\b`, "gi")
        highlightedText = highlightedText.replace(regex, '<mark class="glossary-highlight" title="Key term">$1</mark>')
      })

      console.log("[v0] AI Service - Glossary highlighting completed successfully")
      return highlightedText
    } catch (error) {
      console.error("[v0] AI Service - Glossary highlighting failed:", error)
      return this.validateContent(text)
    }
  }

  private stripHtml(html: string): string {
    if (!html || typeof html !== "string") return ""
    return html.replace(/<[^>]*>/g, "").trim()
  }
}

export const aiService = new AIService()
export type { GrammarCheck, TagSuggestion, Summary, Translation, AIInsights }
