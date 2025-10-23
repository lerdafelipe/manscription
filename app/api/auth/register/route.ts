import { type NextRequest, NextResponse } from "next/server"
import { createUser, getUserByEmail } from "@/lib/auth"
import { createSession } from "@/lib/session"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Starting registration process")

    const { name, email, password } = await request.json()
    console.log("[v0] Received registration data:", { email, name })

    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 })
    }

    console.log("[v0] Checking if user exists")
    const existingUser = await getUserByEmail(email)

    if (existingUser) {
      return NextResponse.json({ error: "Este email ya está registrado" }, { status: 400 })
    }

    console.log("[v0] Creating new user")
    const user = await createUser(email, password, name)
    console.log("[v0] User created successfully:", user.id)

    console.log("[v0] Creating session")
    await createSession(user.id)

    return NextResponse.json({ user })
  } catch (error) {
    console.error("[v0] Register error:", error)
    return NextResponse.json(
      {
        error: "Error al crear la cuenta",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
