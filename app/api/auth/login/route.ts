import { type NextRequest, NextResponse } from "next/server"
import { getUserByEmail, verifyPassword } from "@/lib/auth"
import { createSession } from "@/lib/session"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Login attempt started")
    const { email, password } = await request.json()

    if (!email || !password) {
      console.log("[v0] Missing email or password")
      return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 })
    }

    console.log("[v0] Getting user by email:", email)
    const user = await getUserByEmail(email)

    if (!user) {
      console.log("[v0] User not found")
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    if (!user.password_hash) {
      console.log("[v0] User has no password (OAuth user)")
      return NextResponse.json({ error: "Esta cuenta usa login con Google" }, { status: 401 })
    }

    console.log("[v0] Verifying password")
    const isValidPassword = await verifyPassword(password, user.password_hash)

    if (!isValidPassword) {
      console.log("[v0] Invalid password")
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    console.log("[v0] Creating session for user:", user.id)
    await createSession(user.id)

    console.log("[v0] Login successful")
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    })
  } catch (error) {
    console.error("[v0] Login error:", error)
    return NextResponse.json({ error: "Error al iniciar sesión" }, { status: 500 })
  }
}
