import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { isDemoMode } from './lib/demo-auth'

const isPublicRoute = createRouteMatcher(['/', '/sign-in(.*)', '/sign-up(.*)'])
const isDemoRoute = createRouteMatcher(['/dashboard(.*)', '/api(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isDemoMode() && isDemoRoute(req)) {
    return
  }

  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}