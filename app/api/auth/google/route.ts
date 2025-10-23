import { type NextRequest, NextResponse } from "next/server"

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const GOOGLE_REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`
  : "http://localhost:3000/api/auth/google/callback"

export async function GET(request: NextRequest) {
  if (!GOOGLE_CLIENT_ID) {
    return NextResponse.json({ error: "Google OAuth no configurado" }, { status: 500 })
  }

  const searchParams = request.nextUrl.searchParams
  const redirectTo = searchParams.get("redirect") || "/dashboard"

  // Store redirect URL in a cookie or session
  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth")
  googleAuthUrl.searchParams.set("client_id", GOOGLE_CLIENT_ID)
  googleAuthUrl.searchParams.set("redirect_uri", GOOGLE_REDIRECT_URI)
  googleAuthUrl.searchParams.set("response_type", "code")
  googleAuthUrl.searchParams.set("scope", "openid email profile")
  googleAuthUrl.searchParams.set("state", redirectTo)

  return NextResponse.redirect(googleAuthUrl.toString())
}
