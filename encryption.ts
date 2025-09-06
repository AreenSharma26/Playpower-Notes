// Simple encryption service for note protection
// Note: In production, use a more robust encryption library like crypto-js

class EncryptionService {
  // Simple XOR-based encryption for demo purposes
  // In production, use AES or similar strong encryption
  private simpleEncrypt(text: string, password: string): string {
    let result = ""
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ password.charCodeAt(i % password.length)
      result += String.fromCharCode(charCode)
    }
    return btoa(result) // Base64 encode
  }

  private simpleDecrypt(encryptedText: string, password: string): string {
    try {
      const decoded = atob(encryptedText) // Base64 decode
      let result = ""
      for (let i = 0; i < decoded.length; i++) {
        const charCode = decoded.charCodeAt(i) ^ password.charCodeAt(i % password.length)
        result += String.fromCharCode(charCode)
      }
      return result
    } catch (error) {
      throw new Error("Failed to decrypt content")
    }
  }

  // Hash password for verification (simple hash for demo)
  hashPassword(password: string): string {
    let hash = 0
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString()
  }

  // Encrypt note content
  encryptContent(content: string, password: string): { encryptedContent: string; passwordHash: string } {
    const encryptedContent = this.simpleEncrypt(content, password)
    const passwordHash = this.hashPassword(password)
    return { encryptedContent, passwordHash }
  }

  // Decrypt note content
  decryptContent(encryptedContent: string, password: string, passwordHash: string): string {
    // Verify password first
    if (this.hashPassword(password) !== passwordHash) {
      throw new Error("Invalid password")
    }
    return this.simpleDecrypt(encryptedContent, password)
  }

  // Verify password without decrypting
  verifyPassword(password: string, passwordHash: string): boolean {
    return this.hashPassword(password) === passwordHash
  }
}

export const encryptionService = new EncryptionService()
