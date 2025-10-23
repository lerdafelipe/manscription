"use server"

import { sql } from "@/lib/db"
import { getSession } from "@/lib/session"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { encrypt } from "@/lib/encryption"

export async function addSubscription(data: {
  name: string
  amount: number
  period: string
  nextPaymentDate: string
  bank: string
  cardLastFour: string
  category: string
}) {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: "No autorizado" }
    }

    const encryptedCardLastFour = data.cardLastFour ? encrypt(data.cardLastFour) : null

    await sql`
      INSERT INTO subscriptions (
        user_id, name, amount, period, next_payment_date, 
        bank, card_last_four, category
      )
      VALUES (
        ${session.userId}, ${data.name}, ${data.amount}, ${data.period},
        ${data.nextPaymentDate}, ${data.bank}, ${encryptedCardLastFour}, ${data.category}
      )
    `

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("[v0] Error adding subscription:", error)
    return { success: false, error: "Error al añadir suscripción" }
  }
}

export async function deleteSubscription(id: number) {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: "No autorizado" }
    }

    await sql`
      DELETE FROM subscriptions 
      WHERE id = ${id} AND user_id = ${session.userId}
    `

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("[v0] Error deleting subscription:", error)
    return { success: false, error: "Error al eliminar suscripción" }
  }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete("session")
  revalidatePath("/")
}
