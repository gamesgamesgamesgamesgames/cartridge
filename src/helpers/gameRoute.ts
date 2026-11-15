// Where a game lives on the site, and how /game/[slug] finds it.
//
// A game is normally reached by its slug. Some games have none: games in an
// author's own repo don't get one, and a catalogue game can briefly be without
// one. Those are reached by their record instead:
//   /game/<rkey>          a catalogue game, by its record key
//   /game/<encoded uri>   any other game, by its full AT URI
// The page resolves the slug first, so a slug that happens to look like a
// record key still wins.

export const GAME_COLLECTION = 'games.gamesgamesgamesgames.game'

/** The catalogue repo (the instance's Pentaract account). */
export const CATALOGUE_DID = process.env.NEXT_PUBLIC_CATALOGUE_DID || 'did:web:gamesgamesgamesgames.games'

// atproto TIDs: 13 characters of base32-sortable, first one 2-7 or a-j.
const RECORD_KEY = /^[2-7a-j][2-7a-z]{12}$/

const GAME_URI = new RegExp(`^at://([^/]+)/${GAME_COLLECTION.replaceAll('.', '\\.')}/([^/]+)$`)

function safeDecode(value: string): string {
	try {
		return decodeURIComponent(value)
	} catch {
		return value
	}
}

export function isRecordKey(value: string): boolean {
	return RECORD_KEY.test(value)
}

/**
 * The game URI a /game/[slug] parameter names when it isn't a slug: a
 * catalogue record key, or a full, URL-encoded game URI. Undefined otherwise.
 */
export function gameUriFromParam(param: string): string | undefined {
	const value = safeDecode(param)
	if (isRecordKey(value)) {
		return `at://${CATALOGUE_DID}/${GAME_COLLECTION}/${value}`
	}
	if (GAME_URI.test(value)) {
		return value
	}
	return undefined
}

/** The path segment for a game URI: its record key for a catalogue game, else the encoded URI. */
export function gameParamFromUri(uri: string): string | undefined {
	const match = GAME_URI.exec(uri)
	if (!match) return undefined
	const [, did, rkey] = match
	return did === CATALOGUE_DID && isRecordKey(rkey) ? rkey : encodeURIComponent(uri)
}

/** The /game path segment for a route parameter, encoded for use in a URL. */
export function encodeGameParam(param: string): string {
	return encodeURIComponent(safeDecode(param))
}

/**
 * The page for a game: by slug when it has one, otherwise by record.
 * Undefined when there's neither (the caller decides what to render).
 */
export function gameHref(game: { slug?: string | null; uri?: string | null } | null | undefined): string | undefined {
	if (!game) return undefined
	if (game.slug) return `/game/${encodeURIComponent(game.slug)}`
	const param = game.uri ? gameParamFromUri(game.uri) : undefined
	return param ? `/game/${param}` : undefined
}
