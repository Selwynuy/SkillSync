import { auth } from "@/auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { nextUrl } = req

  // Protected routes that require authentication
  const protectedRoutes = ["/dashboard", "/assessments", "/settings", "/recommendations"]
  const isProtectedRoute = protectedRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  )

  // Auth routes that should redirect to dashboard if already logged in
  const authRoutes = ["/auth/signin", "/auth/signup", "/auth/magic"]
  const isAuthRoute = authRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  )

  // Redirect to sign-in if accessing protected route while not logged in
  if (isProtectedRoute && !isLoggedIn) {
    const signInUrl = new URL("/auth/signin", nextUrl.origin)
    signInUrl.searchParams.set("callbackUrl", nextUrl.pathname)
    return Response.redirect(signInUrl)
  }

  // Redirect to dashboard if accessing auth routes while logged in
  if (isAuthRoute && isLoggedIn) {
    return Response.redirect(new URL("/dashboard", nextUrl.origin))
  }

  return undefined
})

// See https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
