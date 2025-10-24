import { NextResponse } from "next/server"

let cachedRates: { USD: number; EUR: number; lastUpdate: string } | null = null
let lastFetchDate: string | null = null

export async function GET() {
  const today = new Date().toISOString().split("T")[0]

  // Check if we have cached rates for today
  if (cachedRates && lastFetchDate === today) {
    console.log("[v0] Returning cached exchange rates")
    return NextResponse.json(cachedRates)
  }

  console.log("[v0] Fetching new exchange rates")

  // Mock exchange rates (in production, fetch from a real API)
  // These are example rates: 1 USD = X ARS, 1 EUR = X ARS
  const rates = {
    USD: 1050.5, // 1 USD = 1050.50 ARS
    EUR: 1150.75, // 1 EUR = 1150.75 ARS
    lastUpdate: new Date().toISOString(),
  }

  // Cache the rates
  cachedRates = rates
  lastFetchDate = today

  return NextResponse.json(rates)
}
