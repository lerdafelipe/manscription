import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-change-in-production")

export async function createSession(userId: number) {
  const token = await new SignJWT({ userId }).setProtectedHeader({ alg: "HS256" }).setExpirationTime("7d").sign(secret)

  const cookieStore = await cookies()
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })
}

export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get("session")?.value

  if (!token) return null

  try {
    const verified = await jwtVerify(token, secret)
    return verified.payload as { userId: number }
  } catch (err) {
    return null
  }
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete("session")
}
