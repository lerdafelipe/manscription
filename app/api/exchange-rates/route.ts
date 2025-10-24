import { NextResponse } from "next/server"

interface ExchangeRates {
  USD: number
  EUR: number
  lastUpdate: string
}

interface CacheData {
  rates: ExchangeRates
  date: string
}

let cache: CacheData | null = null

function getTodayDate(): string {
  // Usar la zona horaria de Argentina para consistencia
  return new Date().toLocaleDateString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).split("/").reverse().join("-")
}

function isCacheValid(): boolean {
  if (!cache) return false
  
  const today = getTodayDate()
  const isValid = cache.date === today
  
  if (!isValid) {
    console.log(`Cache expired. Cached date: ${cache.date}, Today: ${today}`)
  }
  
  return isValid
}

export async function GET() {
  // Retornar caché si es válido
  if (isCacheValid()) {
    console.log("Returning cached exchange rates")
    return NextResponse.json(cache!.rates, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    })
  }

  try {
    console.log("Fetching new exchange rates...")
    
    const [dolarRes, euroRes, dolarOficialRes] = await Promise.all([
      fetch("https://dolarapi.com/v1/dolares/tarjeta", { 
        next: { revalidate: 86400 } // 24 horas
      }),
      fetch("https://dolarapi.com/v1/cotizaciones/eur", { 
        next: { revalidate: 86400 } 
      }),
      fetch("https://dolarapi.com/v1/dolares/oficial", { 
        next: { revalidate: 86400 } 
      }),
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

    // Validar que los valores sean números válidos
    if (isNaN(usdToArs) || isNaN(eurToArs)) {
      throw new Error("Invalid exchange rate values")
    }

    const rates: ExchangeRates = {
      USD: Math.round(usdToArs * 100) / 100, // Redondear a 2 decimales
      EUR: Math.round(eurToArs * 100) / 100,
      lastUpdate: new Date().toISOString(),
    }

    // Actualizar caché
    cache = {
      rates,
      date: getTodayDate(),
    }

    console.log("Successfully cached new exchange rates:", rates)
    
    return NextResponse.json(rates, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    })
  } catch (error) {
    console.error("Error fetching exchange rates:", error)
    
    // Si hay un error pero tenemos caché antiguo, devolverlo como fallback
    if (cache) {
      console.log("Returning stale cache due to error")
      return NextResponse.json(cache.rates, {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=3600",
          "X-Cache-Status": "stale",
        },
      })
    }
    
    return NextResponse.json(
      { error: "Error fetching exchange rates" },
      { status: 500 }
    )
  }
}