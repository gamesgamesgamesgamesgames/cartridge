// Module imports
import { type AtUriString } from '@atproto/lex'

// Local imports
import { type DID } from '@/typedefs/DID'
import { type GameRecord } from '@/typedefs/GameRecord'
import { type InputBody as ActorProfileInput } from '@/helpers/lexicons/games/gamesgamesgamesgames/actor/putProfile.defs'
import { type InputBody as OrgProfileInput } from '@/helpers/lexicons/games/gamesgamesgamesgames/org/putProfile.defs'
import { type MediaItem } from '@/typedefs/MediaItem'
import { type PopfeedReview } from '@/helpers/lexicons/games/gamesgamesgamesgames/getReviews.defs'
import { type PentaractAPICreateGameOptions } from '@/typedefs/PentaractAPICreateGameOptions'
import { type PentaractAPICreateProfileResult } from '@/typedefs/PentaractAPICreateProfileResult'
import { type PentaractAPIGetBlueskyProfileResult } from '@/typedefs/PentaractAPIGetBlueskyProfileResult'
import { type PentaractAPIGetProfileResult } from '@/typedefs/PentaractAPIGetProfileResult'
import { type PentaractAPIPutGameOptions } from '@/typedefs/PentaractAPIPutGameOptions'
import { type PentaractAPIQueryOptions } from '@/typedefs/PentaractAPIQueryOptions'
import { type PentaractAPISearchResult } from '@/typedefs/PentaractAPISearchResult'
import { type PentaractAPISearchProfilesTypeaheadResult } from '@/typedefs/PentaractAPISearchProfilesTypeaheadResult'
import { type PentaractAPIUploadBlobResult } from '@/typedefs/PentaractAPIUploadBlobResult'
import { type UnpublishedGame } from '@/typedefs/UnpublishedGame'
import { getAccessToken } from '@/helpers/oauth'

// Constants
const API_URL = process.env.NEXT_PUBLIC_HAPPYVIEW_URL!

// ---------------------------------------------------------------------------
// Core
// ---------------------------------------------------------------------------

async function queryAPI(path: string, options: PentaractAPIQueryOptions = {}) {
	const { isAuthenticated = false, ...fetchOptions } = options
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		...(fetchOptions.headers as Record<string, string>),
	}

	if (isAuthenticated) {
		const token = getAccessToken()
		if (token) {
			headers['Authorization'] = `Bearer ${token}`
		}
	}

	return fetch(`${API_URL}${path}`, {
		...fetchOptions,
		headers,
	})
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function serializeGameBody(gameDetails: UnpublishedGame) {
	const body: Record<string, unknown> = {}

	if (gameDetails.summary) body.summary = gameDetails.summary
	if (gameDetails.applicationType)
		body.applicationType = gameDetails.applicationType
	if (gameDetails.genres?.length) body.genres = gameDetails.genres
	if (gameDetails.modes?.length) body.modes = gameDetails.modes
	if (gameDetails.themes?.length) body.themes = gameDetails.themes
	if (gameDetails.playerPerspectives?.length)
		body.playerPerspectives = gameDetails.playerPerspectives
	if (gameDetails.parent) body.parent = gameDetails.parent

	if (gameDetails.releases?.length) {
		body.releases = gameDetails.releases
	}

	if (gameDetails.media?.length) {
		body.media = serializeMedia(gameDetails.media)
	}

	return body
}

function serializeMedia(media: MediaItem[]) {
	return media
		.filter((item) => item.blob !== null)
		.map((item) => ({
			blob: {
				$type: 'blob',
				ref: { $link: item.blob!.ref },
				mimeType: item.blob!.mimeType,
				size: item.blob!.size,
			},
			title: item.title,
			description: item.description,
			...(item.width !== null ? { width: item.width } : {}),
			...(item.height !== null ? { height: item.height } : {}),
			...(item.locale !== null ? { locale: item.locale } : {}),
			...(item.mediaType !== null ? { mediaType: item.mediaType } : {}),
		}))
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function createGame(
	gameDetails: UnpublishedGame,
	options: PentaractAPICreateGameOptions = {},
): Promise<AtUriString> {
	const body = {
		...serializeGameBody(gameDetails),
		name: gameDetails.name,
		shouldPublish: options.shouldPublish ?? false,
	}

	const response = await queryAPI(
		'/xrpc/games.gamesgamesgamesgames.createGame',
		{
			isAuthenticated: true,
			method: 'POST',
			body: JSON.stringify(body),
		},
	)

	if (!response.ok) {
		const errorBody = await response.text()
		throw new Error(`createGame failed (${response.status}): ${errorBody}`)
	}

	const data = await response.json()
	return data.uri as AtUriString
}

export async function listGames(
	limit = 20,
	cursor?: string,
	sort?: string,
	sortDirection?: 'asc' | 'desc',
	did?: string,
): Promise<{ cursor?: string; games: GameRecord[] }> {
	const params = new URLSearchParams({ limit: String(limit) })
	if (cursor) {
		params.set('cursor', cursor)
	}
	if (sort) {
		params.set('sort', sort)
	}
	if (sortDirection) {
		params.set('sortDirection', sortDirection)
	}
	if (did) {
		params.set('did', did)
	}

	const response = await queryAPI(
		`/xrpc/games.gamesgamesgamesgames.listGames?${params}`,
		{ isAuthenticated: !did },
	)

	if (!response.ok) {
		const errorBody = await response.text()
		throw new Error(`listGames failed (${response.status}): ${errorBody}`)
	}

	return response.json()
}

export async function getGame(query: { uri: string } | { slug: string }): Promise<GameRecord | undefined> {
	const params = 'slug' in query
		? `slug=${encodeURIComponent(query.slug)}`
		: `uri=${encodeURIComponent(query.uri)}`
	const resp = await queryAPI(
		`/xrpc/games.gamesgamesgamesgames.getGame?${params}`,
	)

	if (!resp.ok) {
		return undefined
	}

	const data = await resp.json()
	return data.game as GameRecord
}

export async function getReviews(
	uri: string,
	limit = 20,
): Promise<{ reviews: PopfeedReview[]; cursor?: string }> {
	const params = new URLSearchParams({
		uri,
		limit: String(limit),
	})

	const resp = await queryAPI(
		`/xrpc/games.gamesgamesgamesgames.getReviews?${params}`,
	)

	if (!resp.ok) {
		return { reviews: [] }
	}

	return resp.json()
}

export async function getProfile(): Promise<PentaractAPIGetProfileResult> {
	const response = await queryAPI(
		'/xrpc/games.gamesgamesgamesgames.getProfile',
		{ isAuthenticated: true },
	)

	if (!response.ok) {
		return { profile: null, profileType: null }
	}

	return response.json()
}

export async function getProfileByHandle(
	handle: string,
): Promise<PentaractAPIGetProfileResult> {
	const params = new URLSearchParams({ handle })
	const response = await queryAPI(
		`/xrpc/games.gamesgamesgamesgames.getProfile?${params}`,
	)

	if (!response.ok) {
		return { profile: null, profileType: null }
	}

	return response.json()
}

export async function getBlueskyProfile(): Promise<PentaractAPIGetBlueskyProfileResult | null> {
	const response = await queryAPI('/xrpc/app.bsky.actor.getProfile', {
		isAuthenticated: true,
	})

	if (!response.ok) {
		return null
	}

	return response.json()
}

export async function search(
	q: string,
	options: {
		limit?: number
		types?: string[]
		applicationTypes?: string[]
		sort?: string
		genres?: string[]
		themes?: string[]
		modes?: string[]
		playerPerspectives?: string[]
		ageRatings?: string[]
		includeUnrated?: boolean
		includeCancelled?: boolean
		cursor?: string
	} = {},
): Promise<PentaractAPISearchResult> {
	const params = new URLSearchParams({ q })
	if (options.limit) {
		params.set('limit', String(options.limit))
	}
	if (options.types?.length) {
		for (const type of options.types) {
			params.append('types', type)
		}
	}
	if (options.applicationTypes?.length) {
		params.set('applicationTypes', options.applicationTypes.join(','))
	}
	if (options.sort) {
		params.set('sort', options.sort)
	}
	if (options.genres?.length) {
		params.set('genres', options.genres.join(','))
	}
	if (options.themes?.length) {
		params.set('themes', options.themes.join(','))
	}
	if (options.modes?.length) {
		params.set('modes', options.modes.join(','))
	}
	if (options.playerPerspectives?.length) {
		params.set('playerPerspectives', options.playerPerspectives.join(','))
	}
	if (options.ageRatings?.length) {
		params.set('ageRatings', options.ageRatings.join(','))
	}
	if (options.includeUnrated) {
		params.set('includeUnrated', 'true')
	}
	if (options.includeCancelled) {
		params.set('includeCancelled', 'true')
	}
	if (options.cursor) {
		params.set('cursor', options.cursor)
	}

	const response = await queryAPI(
		`/xrpc/games.gamesgamesgamesgames.search?${params}`,
	)

	if (!response.ok) {
		return { results: [] }
	}

	return response.json()
}

export async function searchProfilesTypeahead(
	q: string,
	limit = 10,
): Promise<PentaractAPISearchProfilesTypeaheadResult> {
	const params = new URLSearchParams({ q, limit: String(limit) })
	const response = await queryAPI(
		`/xrpc/games.gamesgamesgamesgames.searchProfilesTypeahead?${params}`,
	)

	if (!response.ok) {
		return { profiles: [] }
	}

	return response.json()
}

export async function putActorProfile(
	profile: ActorProfileInput,
): Promise<PentaractAPICreateProfileResult> {
	const response = await queryAPI(
		'/xrpc/games.gamesgamesgamesgames.actor.putProfile',
		{
			isAuthenticated: true,
			method: 'POST',
			body: JSON.stringify(profile),
		},
	)

	if (!response.ok) {
		const errorBody = await response.text()
		throw new Error(
			`putActorProfile failed (${response.status}): ${errorBody}`,
		)
	}

	return response.json()
}

export async function putOrgProfile(
	profile: OrgProfileInput,
): Promise<PentaractAPICreateProfileResult> {
	const response = await queryAPI(
		'/xrpc/games.gamesgamesgamesgames.org.putProfile',
		{
			isAuthenticated: true,
			method: 'POST',
			body: JSON.stringify(profile),
		},
	)

	if (!response.ok) {
		const errorBody = await response.text()
		throw new Error(
			`putOrgProfile failed (${response.status}): ${errorBody}`,
		)
	}

	return response.json()
}

export async function putGame(
	uri: AtUriString,
	gameDetails: UnpublishedGame,
	options: PentaractAPIPutGameOptions = {},
): Promise<AtUriString> {
	const body = {
		...serializeGameBody(gameDetails),
		uri,
		name: gameDetails.name,
		createdAt: gameDetails.createdAt,
		shouldPublish: options.shouldPublish ?? false,
	}

	const response = await queryAPI('/xrpc/games.gamesgamesgamesgames.putGame', {
		isAuthenticated: true,
		method: 'POST',
		body: JSON.stringify(body),
	})

	if (!response.ok) {
		const errorBody = await response.text()
		throw new Error(`putGame failed (${response.status}): ${errorBody}`)
	}

	const data = await response.json()
	return data.uri as AtUriString
}

export async function toggleLike(
	subject: string,
): Promise<{ uri?: string; cid?: string; action: 'liked' | 'unliked' }> {
	const response = await queryAPI(
		'/xrpc/games.gamesgamesgamesgames.graph.toggleLike',
		{
			isAuthenticated: true,
			method: 'POST',
			body: JSON.stringify({ subject }),
		},
	)

	if (!response.ok) {
		const errorBody = await response.text()
		throw new Error(`toggleLike failed (${response.status}): ${errorBody}`)
	}

	return response.json()
}

export async function getLikes(
	uri: string,
): Promise<{ count: number; liked: boolean }> {
	const params = new URLSearchParams({ uri })
	const resp = await queryAPI(
		`/xrpc/games.gamesgamesgamesgames.graph.getLikes?${params}`,
		{ isAuthenticated: true },
	)

	if (!resp.ok) {
		return { count: 0, liked: false }
	}

	return resp.json()
}

export async function resolveHandle(_handle: string): Promise<DID | null> {
	console.warn(
		'[pentaract] API.resolveHandle is stubbed — HappyView data API not yet available',
	)
	return null
}

export async function uploadBlob(
	file: File,
): Promise<PentaractAPIUploadBlobResult> {
	const response = await queryAPI('/xrpc/com.atproto.repo.uploadBlob', {
		isAuthenticated: true,
		method: 'POST',
		headers: {
			'Content-Type': file.type,
		},
		body: file,
	})

	if (!response.ok) {
		const errorBody = await response.text()
		throw new Error(`uploadBlob failed (${response.status}): ${errorBody}`)
	}

	const data = await response.json()

	return {
		ref: data.blob.ref.$link,
		mimeType: data.blob.mimeType,
		size: data.blob.size,
	}
}
