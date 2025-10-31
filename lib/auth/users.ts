import { User } from "@/lib/types"
import bcrypt from "bcryptjs"

// In-memory user store for MVP
// In production, this would be replaced with a database
const users: Map<string, User & { password: string }> = new Map()

// Seed with a demo user
const demoPasswordHash = bcrypt.hashSync("demo123", 10)
users.set("demo@skillsync.com", {
  id: "user-001",
  email: "demo@skillsync.com",
  name: "Demo User",
  password: demoPasswordHash,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
})

export async function getUserByEmail(
  email: string
): Promise<(User & { password: string }) | null> {
  return users.get(email.toLowerCase()) || null
}

export async function createUser(
  email: string,
  password: string,
  name?: string
): Promise<User> {
  const normalizedEmail = email.toLowerCase()

  if (users.has(normalizedEmail)) {
    throw new Error("User already exists")
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const user = {
    id: `user-${Date.now()}`,
    email: normalizedEmail,
    name,
    password: hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  users.set(normalizedEmail, user)

  // Return user without password
  const { password: _, ...userWithoutPassword } = user
  return userWithoutPassword
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// Magic link token store (in-memory for MVP)
const magicTokens: Map<
  string,
  { email: string; expires: Date; used: boolean }
> = new Map()

export function createMagicToken(email: string): string {
  const token = `magic-${Date.now()}-${Math.random().toString(36).slice(2)}`
  const expires = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

  magicTokens.set(token, {
    email: email.toLowerCase(),
    expires,
    used: false,
  })

  return token
}

export async function verifyMagicToken(
  token: string
): Promise<string | null> {
  const tokenData = magicTokens.get(token)

  if (!tokenData) {
    return null
  }

  if (tokenData.used) {
    return null
  }

  if (tokenData.expires < new Date()) {
    magicTokens.delete(token)
    return null
  }

  // Mark token as used
  tokenData.used = true

  return tokenData.email
}
