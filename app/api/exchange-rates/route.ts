import { NextResponse } from "next/server"
import { unstable_cache } from "next/cache"

interface ExchangeRates {
  USD: number
  EUR: number
  lastUpdate: string
}

async function fetchExchangeRates(): Promise<ExchangeRates> {
  console.log("Fetching fresh exchange rates from API...")
  
  const [dolarRes, euroRes, dolarOficialRes] = await Promise.all([
    fetch("https://dolarapi.com/v1/dolares/tarjeta"),
    fetch("https://dolarapi.com/v1/cotizaciones/eur"),
    fetch("https://dolarapi.com/v1/dolares/oficial"),
  ])

  if (!dolarRes.ok || !euroRes.ok || !dolarOficialRes.ok) {
    throw new Error("Failed to fetch exchange rates")
  }

  const [dolarData, euroData, dolarOficialData] = await Promise.all([
    dolarRes.json(),
    euroRes.json(),
    dolarOficialRes.json(),
  ])

  const usdToArs = parseFloat(dolarData.venta)
  const eurToUsd = parseFloat(euroData.compra) / parseFloat(dolarOficialData.compra)
  const eurToArs = eurToUsd * usdToArs

  if (isNaN(usdToArs) || isNaN(eurToArs)) {
    throw new Error("Invalid exchange rate values")
  }

  return {
    USD: Math.round(usdToArs * 100) / 100,
    EUR: Math.round(eurToArs * 100) / 100,
    lastUpdate: new Date().toISOString(),
  }
}

// Cache con revalidación diaria
const getCachedRates = unstable_cache(
  fetchExchangeRates,
  ["exchange-rates"], // cache key
  {
    revalidate: 86400, // 24 horas en segundos
    tags: ["exchange-rates"], // para revalidación manual si necesitas
  }
)

export async function GET() {
  try {
    const rates = await getCachedRates()
    
    return NextResponse.json(rates, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    })
  } catch (error) {
    console.error("Error fetching exchange rates:", error)
    return NextResponse.json(
      { error: "Error fetching exchange rates" },
      { status: 500 }
    )
  }
}

// Opcional: Endpoint para forzar revalidación manual
export async function POST() {
  const { revalidateTag } = await import("next/cache")
  revalidateTag("exchange-rates")
  
  return NextResponse.json({ revalidated: true })
}