import crypto from "crypto"

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET || "default-encryption-key-change-me"
const ALGORITHM = "aes-256-cbc"

// Ensure key is 32 bytes for AES-256
function getKey(): Buffer {
  return crypto.createHash("sha256").update(ENCRYPTION_KEY).digest()
}

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv)

  let encrypted = cipher.update(text, "utf8", "hex")
  encrypted += cipher.final("hex")

  // Return IV + encrypted data
  return iv.toString("hex") + ":" + encrypted
}

export function decrypt(encryptedText: string): string {
  const parts = encryptedText.split(":")
  if (parts.length !== 2) {
    throw new Error("Invalid encrypted text format")
  }

  const iv = Buffer.from(parts[0], "hex")
  const encrypted = parts[1]

  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv)

  let decrypted = decipher.update(encrypted, "hex", "utf8")
  decrypted += decipher.final("utf8")

  return decrypted
}
