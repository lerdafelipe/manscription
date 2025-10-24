"use server"

import { sql } from "@/lib/db"
import { getSession } from "@/lib/session"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { encrypt, decrypt } from "@/lib/encryption"

export async function addSubscription(data: {
  name: string
  amount: number
  period: string
  nextPaymentDate: string
  paymentMethod: string
  bank: string
  cardLastFour: string
  category: string
  currency: string
}) {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: "No autorizado" }
    }

    const encryptedCardLastFour = data.cardLastFour ? encrypt(data.cardLastFour) : null

    const result = await sql`
      INSERT INTO subscriptions (
        user_id, name, amount, period, next_payment_date, 
        payment_method, bank, card_last_four, category, currency
      )
      VALUES (
        ${session.userId}, ${data.name}, ${data.amount}, ${data.period},
        ${data.nextPaymentDate}, ${data.paymentMethod}, ${data.bank || null}, 
        ${encryptedCardLastFour}, ${data.category}, ${data.currency}
      )
      RETURNING 
        id, 
        name, 
        logo_url, 
        amount::text as amount, 
        period, 
        next_payment_date, 
        bank, 
        card_last_four, 
        category, 
        currency, 
        payment_method
    `

    const newSubscription = result[0]

    // Crear el objeto subscription con el formato correcto
    const subscription = {
      id: newSubscription.id,
      name: newSubscription.name,
      logo_url: newSubscription.logo_url,
      amount: newSubscription.amount,
      period: newSubscription.period,
      next_payment_date: newSubscription.next_payment_date,
      bank: newSubscription.bank,
      card_last_four: newSubscription.card_last_four ? decrypt(newSubscription.card_last_four) : null,
      category: newSubscription.category,
      currency: newSubscription.currency,
      payment_method: newSubscription.payment_method,
    }

    revalidatePath("/dashboard")
    return { success: true, subscription }
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