import { sql } from "./db"
import bcrypt from "bcryptjs"

export interface User {
  id: number
  email: string
  name: string | null
  provider?: string
  providerId?: string
  avatarUrl?: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createUser(email: string, password: string, name?: string): Promise<User> {
  console.log("[v0] Hashing password")
  const passwordHash = await hashPassword(password)

  console.log("[v0] Inserting user into database")
  const result = await sql`
    INSERT INTO users (email, password_hash, name)
    VALUES (${email}, ${passwordHash}, ${name || null})
    RETURNING id, email, name
  `

  console.log("[v0] User inserted successfully")
  return result[0] as User
}

export async function createOAuthUser(
  email: string,
  name: string,
  provider: string,
  providerId: string,
  avatarUrl?: string,
): Promise<User> {
  console.log("[v0] Creating OAuth user")

  // Check if user already exists with this provider
  const existingUser = await sql`
    SELECT id, email, name
    FROM users
    WHERE provider = ${provider} AND provider_id = ${providerId}
  `

  if (existingUser[0]) {
    console.log("[v0] OAuth user already exists")
    return existingUser[0] as User
  }

  // Check if user exists with same email but different provider
  const emailUser = await sql`
    SELECT id, email, name, provider
    FROM users
    WHERE email = ${email}
  `

  if (emailUser[0]) {
    // Link the OAuth account to existing user
    console.log("[v0] Linking OAuth to existing user")
    const result = await sql`
      UPDATE users
      SET provider = ${provider}, provider_id = ${providerId}, avatar_url = ${avatarUrl || null}
      WHERE email = ${email}
      RETURNING id, email, name
    `
    return result[0] as User
  }

  // Create new OAuth user
  console.log("[v0] Inserting new OAuth user into database")
  const result = await sql`
    INSERT INTO users (email, name, provider, provider_id, avatar_url, password_hash)
    VALUES (${email}, ${name}, ${provider}, ${providerId}, ${avatarUrl || null}, NULL)
    RETURNING id, email, name
  `

  console.log("[v0] OAuth user created successfully")
  return result[0] as User
}

export async function getUserByEmail(email: string) {
  try {
    const result = await sql`
      SELECT id, email, password_hash, name
      FROM users
      WHERE email = ${email}
    `
    return result[0]
  } catch (error) {
    console.error("[v0] Error getting user by email:", error)
    throw error
  }
}

export async function getUserByProviderId(provider: string, providerId: string) {
  const result = await sql`
    SELECT id, email, name
    FROM users
    WHERE provider = ${provider} AND provider_id = ${providerId}
  `

  return result[0]
}

export async function getUserById(id: number): Promise<User | null> {
  try {
    const result = await sql`
      SELECT id, email, name
      FROM users
      WHERE id = ${id}
    `
    return (result[0] as User) || null
  } catch (error) {
    console.error("[v0] Error getting user by id:", error)
    return null
  }
}
