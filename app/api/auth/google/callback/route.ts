import { type NextRequest, NextResponse } from "next/server"
import { createOAuthUser } from "@/lib/auth"
import { createSession } from "@/lib/session"

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const GOOGLE_REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`
  : "http://localhost:3000/api/auth/google/callback"

interface GoogleTokenResponse {
  access_token: string
  expires_in: number
  token_type: string
  scope: string
  id_token: string
}

interface GoogleUserInfoOIDC {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  email_verified: boolean;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const state = searchParams.get("state") || "/dashboard"

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=oauth_failed", request.url))
  }

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return NextResponse.redirect(new URL("/login?error=oauth_not_configured", request.url))
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    })

    if (!tokenResponse.ok) {
      console.error("[v0] Token exchange failed:", await tokenResponse.text())
      return NextResponse.redirect(new URL("/login?error=token_exchange_failed", request.url))
    }

    const tokens: GoogleTokenResponse = await tokenResponse.json()

    // Get user info from Google
    const userInfoResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userInfoResponse.ok) {
      console.error("[v0] User info fetch failed:", await userInfoResponse.text())
      return NextResponse.redirect(new URL("/login?error=user_info_failed", request.url))
    }

    const userInfo: GoogleUserInfoOIDC = await userInfoResponse.json()

    if (!userInfo.email_verified) {
      return NextResponse.redirect(new URL("/login?error=email_not_verified", request.url))
    }

    // Create or get user
    const user = await createOAuthUser(
      userInfo.email,
      userInfo.name,
      "google",
      userInfo.sub,
      userInfo.picture
    );

    // Create session
    const response = NextResponse.redirect(new URL(state, request.url))
    await createSession(user.id)

    return response
  } catch (error) {
    console.error("[v0] OAuth error:", error)
    return NextResponse.redirect(new URL("/login?error=oauth_error", request.url))
  }
}
