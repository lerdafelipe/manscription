import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const subscriptions = await sql`
      SELECT id, name, amount, period, next_payment_date, category, bank, card_last_four, logo_url, created_at
      FROM subscriptions
      WHERE user_id = ${session.userId}
      ORDER BY next_payment_date ASC
    `

    return NextResponse.json({ subscriptions })
  } catch (error) {
    console.error("[v0] Get subscriptions error:", error)
    return NextResponse.json({ error: "Error al obtener suscripciones" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { name, amount, period, nextPaymentDate, category, bank, cardLastFour, logoUrl } = await request.json()

    if (!name || !amount || !period || !nextPaymentDate) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO subscriptions (user_id, name, amount, period, next_payment_date, category, bank, card_last_four, logo_url)
      VALUES (${session.userId}, ${name}, ${amount}, ${period}, ${nextPaymentDate}, ${category || null}, ${bank || null}, ${cardLastFour || null}, ${logoUrl || null})
      RETURNING id, name, amount, period, next_payment_date, category, bank, card_last_four, logo_url, created_at
    `

    return NextResponse.json({ subscription: result[0] })
  } catch (error) {
    console.error("[v0] Create subscription error:", error)
    return NextResponse.json({ error: "Error al crear suscripción" }, { status: 500 })
  }
}
