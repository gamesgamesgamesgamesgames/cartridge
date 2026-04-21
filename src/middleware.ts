import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
	// ATProto loopback OAuth redirects to root with ?code=&state= params
	if (request.nextUrl.pathname === '/' && request.nextUrl.searchParams.has('code') && request.nextUrl.searchParams.has('state')) {
		const callbackUrl = new URL('/oauth/callback', request.url)
		callbackUrl.search = request.nextUrl.search
		return NextResponse.redirect(callbackUrl)
	}

	// Auth check only for protected routes (not the homepage)
	if (request.nextUrl.pathname === '/') {
		return NextResponse.next()
	}

	const isAuthenticated = request.cookies.get('pentaract_authenticated')

	if (!isAuthenticated) {
		return NextResponse.redirect(new URL('/login', request.url))
	}

	const profileType = request.cookies.get('pentaract_profile_type')
	const isDashboard = request.nextUrl.pathname.startsWith('/dashboard')

	// Redirect profileless users from dashboard to profile setup
	if (isDashboard && !profileType) {
		return NextResponse.redirect(new URL('/profile-setup', request.url))
	}

	return NextResponse.next()
}

export const config = {
	matcher: ['/', '/dashboard/:path*', '/profile-setup'],
}
