import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { sql } from "@/lib/db"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params

    // Verify ownership before deleting
    const subscription = await sql`
      SELECT id FROM subscriptions
      WHERE id = ${id} AND user_id = ${session.userId}
    `

    if (subscription.length === 0) {
      return NextResponse.json({ error: "Suscripción no encontrada" }, { status: 404 })
    }

    await sql`
      DELETE FROM subscriptions
      WHERE id = ${id} AND user_id = ${session.userId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Delete subscription error:", error)
    return NextResponse.json({ error: "Error al eliminar suscripción" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params
    const { name, amount, period, nextPaymentDate, category, bank, cardLastFour, logoUrl } = await request.json()

    // Verify ownership before updating
    const subscription = await sql`
      SELECT id FROM subscriptions
      WHERE id = ${id} AND user_id = ${session.userId}
    `

    if (subscription.length === 0) {
      return NextResponse.json({ error: "Suscripción no encontrada" }, { status: 404 })
    }

    const result = await sql`
      UPDATE subscriptions
      SET 
        name = COALESCE(${name}, name),
        amount = COALESCE(${amount}, amount),
        period = COALESCE(${period}, period),
        next_payment_date = COALESCE(${nextPaymentDate}, next_payment_date),
        category = COALESCE(${category}, category),
        bank = COALESCE(${bank}, bank),
        card_last_four = COALESCE(${cardLastFour}, card_last_four),
        logo_url = COALESCE(${logoUrl}, logo_url)
      WHERE id = ${id} AND user_id = ${session.userId}
      RETURNING id, name, amount, period, next_payment_date, category, bank, card_last_four, logo_url, created_at
    `

    return NextResponse.json({ subscription: result[0] })
  } catch (error) {
    console.error("[v0] Update subscription error:", error)
    return NextResponse.json({ error: "Error al actualizar suscripción" }, { status: 500 })
  }
}
