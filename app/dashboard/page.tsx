import { SubscriptionDashboard } from "@/components/subscription-dashboard"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"
import { getSession } from "@/lib/session"
import { getUserById } from "@/lib/auth"
import { redirect } from "next/navigation"
import { sql } from "@/lib/db"
import { decrypt } from "@/lib/encryption"

async function getSubscriptions(userId: number) {
  const result = await sql`
    SELECT * FROM subscriptions 
    WHERE user_id = ${userId}
    ORDER BY next_payment_date ASC
  `

  return result.map((sub: any) => ({
    ...sub,
    card_last_four: sub.card_last_four ? decrypt(sub.card_last_four) : null,
  }))
}

export default async function DashboardPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  const user = await getUserById(session.userId)

  if (!user) {
    redirect("/login")
  }

  const subscriptions = await getSubscriptions(session.userId)

  return (
    <>
      <SubscriptionDashboard user={user} initialSubscriptions={subscriptions} />
      <PWAInstallPrompt />
    </>
  )
}
