import { NextRequest, NextResponse } from 'next/server'

import { gameRecordRedirect } from '@/helpers/gameRecordRedirect'

/**
 * Legacy `/dashboard` paths and where they live now, longest prefix first.
 *
 * The studio moved to `/studio`; claiming, verification, and the admin queues
 * had already moved out to their own top-level routes. Keeping these as data
 * here rather than as a stub `page.tsx` per route means arbitrary depth is
 * covered — `/dashboard/admin/claims/<did>/<rkey>` lands in the right place
 * without a file mirroring it.
 *
 * Order matters, and matching is exact-or-followed-by-slash so `/dashboard/claim`
 * doesn't swallow `/dashboard/claims`.
 */
const LEGACY_PATHS: readonly (readonly [string, string])[] = [
	['/dashboard/verification', '/verify'],
	['/dashboard/claim', '/claim'],
	['/dashboard/admin', '/admin'],
	['/dashboard', '/studio'],
] as const

/** The current path for a legacy URL, or `null` if it isn't one. */
export function legacyPathTarget(pathname: string): string | null {
	for (const [from, to] of LEGACY_PATHS) {
		if (pathname === from) {
			return to
		}

		if (pathname.startsWith(`${from}/`)) {
			return to + pathname.slice(from.length)
		}
	}

	return null
}

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl

	// Public game pages: only the record-key redirect applies here, never the
	// auth gates below.
	if (pathname.startsWith('/game/')) {
		return gameRecordRedirect(request)
	}

	// ATProto loopback OAuth redirects to root with ?code=&state= params
	if (
		pathname === '/' &&
		request.nextUrl.searchParams.has('code') &&
		request.nextUrl.searchParams.has('state')
	) {
		const callbackUrl = new URL('/oauth/callback', request.url)
		callbackUrl.search = request.nextUrl.search
		return NextResponse.redirect(callbackUrl)
	}

	// Normalise legacy URLs before anything else, so the auth and profile gates
	// below only ever reason about current paths. The redirected request runs
	// through this middleware again and picks up those checks there.
	const legacyTarget = legacyPathTarget(pathname)

	if (legacyTarget) {
		const target = new URL(legacyTarget, request.url)
		target.search = request.nextUrl.search
		return NextResponse.redirect(target)
	}

	// Auth check only for protected routes (not the homepage)
	if (pathname === '/') {
		return NextResponse.next()
	}

	const isAuthenticated = request.cookies.get('pentaract_authenticated')

	if (!isAuthenticated) {
		return NextResponse.redirect(new URL('/login', request.url))
	}

	const profileType = request.cookies.get('pentaract_profile_type')

	// Redirect profileless users from the studio to profile setup
	if (pathname.startsWith('/studio') && !profileType) {
		return NextResponse.redirect(new URL('/profile-setup', request.url))
	}

	return NextResponse.next()
}

export const config = {
	matcher: [
		'/',
		'/studio',
		'/studio/:path*',
		'/dashboard',
		'/dashboard/:path*',
		'/profile-setup',
		// Record-key game URLs: /game/<rkey> and /game/<rkey>/<section>.
		'/game/:param',
		'/game/:param/:section',
	],
}
