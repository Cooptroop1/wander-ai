import { createMiddlewareClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // ← THIS LINE FIXES THE 405 ERROR
  // Allow all API routes (including our Grok endpoint) to bypass auth
  if (req.nextUrl.pathname.startsWith('/api')) {
    return res
  }

  // Normal Supabase auth for the rest of the app
  const supabase = createMiddlewareClient({ req, res })
  await supabase.auth.getSession()

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
