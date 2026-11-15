import { NextResponse, type NextRequest } from 'next/server'

import { CATALOGUE_DID, GAME_COLLECTION, isRecordKey } from '@/helpers/gameRoute'

// The game sub-routes, which the page shows as sections of the game page.
const SUB_ROUTES = new Set(['meta', 'media', 'reviews'])

type GetGameAnswer = { game?: { slug?: string } }

async function getGame(params: Record<string, string>): Promise<GetGameAnswer | null> {
	const url = new URL('/xrpc/games.gamesgamesgamesgames.getGame', process.env.NEXT_PUBLIC_HAPPYVIEW_URL)
	for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
	try {
		const response = await fetch(url, {
			headers: { 'x-client-key': process.env.NEXT_PUBLIC_HAPPYVIEW_CLIENT_KEY ?? '' },
			signal: AbortSignal.timeout(3000),
		})
		return response.ok ? ((await response.json()) as GetGameAnswer) : null
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
