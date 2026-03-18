import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
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
	matcher: ['/dashboard/:path*', '/profile-setup'],
}
