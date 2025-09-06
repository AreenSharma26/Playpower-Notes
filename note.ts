export interface Note {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
  isPinned: boolean
  isPasswordProtected: boolean
  passwordHash?: string        // secure hashed password
  encryptedContent?: string
  tags: string[]
  formatting?: {
    fontSize: "small" | "medium" | "large"
    alignment: "left" | "center" | "right"
  }
  isUnlocked?: boolean         // session flag
  lastUnlockedAt?: Date        // optional
}

export interface FormattingState {
  bold: boolean
  italic: boolean
  underline: boolean
  fontSize: "small" | "medium" | "large"
  alignment: "left" | "center" | "right"
}
