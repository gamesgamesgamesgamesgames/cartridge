import { NextResponse, type NextRequest } from 'next/server'

import { CATALOGUE_DID, GAME_COLLECTION, isRecordKey } from '@/helpers/gameRoute'
import { happyviewClientHeaders } from '@/helpers/happyviewClient'

// The game sub-routes, which the page shows as sections of the game page.
const SUB_ROUTES = new Set(['meta', 'media', 'reviews'])

type GetGameAnswer = { game?: { slug?: string } }

// Lookups are remembered briefly, per server instance, so a busy record-key
// URL doesn't cost two HappyView calls on every view. That covers the common
// negative case too: a game without a slug, which the page then renders.
// Failures aren't remembered. A new slug shows up within the TTL.
const LOOKUP_TTL_MS = 5 * 60 * 1000
const LOOKUP_CACHE_MAX = 2000
const lookups = new Map<string, { at: number; answer: GetGameAnswer }>()

export function clearGameLookupCache() {
	lookups.clear()
}

async function getGame(params: Record<string, string>): Promise<GetGameAnswer | null> {
	const url = new URL('/xrpc/games.gamesgamesgamesgames.getGame', process.env.NEXT_PUBLIC_HAPPYVIEW_URL)
	for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
	const key = url.search

	const hit = lookups.get(key)
	if (hit && Date.now() - hit.at < LOOKUP_TTL_MS) return hit.answer

	try {
		// Middleware runs on the server, so it uses the server's own client.
		const response = await fetch(url, {
			headers: { ...happyviewClientHeaders() },
			signal: AbortSignal.timeout(3000),
		})
		if (!response.ok) return null
		const answer = (await response.json()) as GetGameAnswer
		if (lookups.size >= LOOKUP_CACHE_MAX) {
			const oldest = lookups.keys().next().value
			if (oldest !== undefined) lookups.delete(oldest)
		}
		lookups.set(key, { at: Date.now(), answer })
		return answer
	} catch {
		return null
	}
}

/**
 * /game/<record key>[/<section>] for a catalogue game that has a slug gets a
 * permanent (308) redirect to /game/<slug>[#<section>], before the page starts
 * streaming, so crawlers see a real redirect. Anything else is left to the
 * page: a slug that merely looks like a record key, a game without a slug
 * (shown at its record URL), a game that doesn't exist (404), and any lookup
 * failure (the page handles it, and redirects in-page as a fallback).
 */
export async function gameRecordRedirect(request: NextRequest): Promise<NextResponse> {
	const [, segment, param, sub, ...rest] = request.nextUrl.pathname.split('/')
	if (segment !== 'game' || !param || rest.length > 0 || !isRecordKey(param)) {
		return NextResponse.next()
	}
	if (sub !== undefined && !SUB_ROUTES.has(sub)) {
		return NextResponse.next()
	}

	// A real slug wins over the record-key reading.
	const bySlug = await getGame({ slug: param })
	if (bySlug === null || bySlug.game) {
		return NextResponse.next()
	}

	const byUri = await getGame({ uri: `at://${CATALOGUE_DID}/${GAME_COLLECTION}/${param}` })
	const slug = byUri?.game?.slug
	if (!slug) {
		return NextResponse.next()
	}

	const target = new URL(`/game/${encodeURIComponent(slug)}`, request.url)
	target.search = request.nextUrl.search
	if (sub) target.hash = sub
	return NextResponse.redirect(target, 308)
}
