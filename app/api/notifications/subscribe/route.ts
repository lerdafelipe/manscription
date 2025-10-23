import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { sql } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const subscription = await request.json()

    // Store subscription in database
    await sql`
      INSERT INTO push_subscriptions (user_id, subscription_data)
      VALUES (${session.userId}, ${JSON.stringify(subscription)})
      ON CONFLICT (user_id) 
      DO UPDATE SET subscription_data = ${JSON.stringify(subscription)}, updated_at = NOW()
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error saving push subscription:", error)
    return NextResponse.json({ error: "Error al guardar suscripción" }, { status: 500 })
  }
}
