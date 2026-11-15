// Module imports
import { type AtUriString } from '@atproto/lex'

// Local imports
import { type AccountType } from '@/constants/ACCOUNT_TYPES'
import { type DID } from '@/typedefs/DID'
import { type GameRecord } from '@/typedefs/GameRecord'
import { type $InputBody as ActorProfileInput } from '@/helpers/lexicons/games/gamesgamesgamesgames/actor/putProfile.defs'
import { type $InputBody as OrgProfileInput } from '@/helpers/lexicons/games/gamesgamesgamesgames/org/putProfile.defs'
import { type MediaItem } from '@/typedefs/MediaItem'
import { type PopfeedReview } from '@/helpers/lexicons/games/gamesgamesgamesgames/getReviews.defs'
import {
	type ClaimView,
	type ReviewView,
} from '@/helpers/lexicons/dev/cartridge/claims/getClaim.defs'
import { type GameSummaryView } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'
import { type ContributionView } from '@/helpers/lexicons/games/gamesgamesgamesgames/getContribution.defs'
import {
	type ContributionStats,
	type Badge,
} from '@/helpers/lexicons/games/gamesgamesgamesgames/getContributionStats.defs'
import { type AnalyticsRange } from '@/helpers/analytics/constants'
import {
	type GameAnalytics,
	type MyGamesAnalytics,
} from '@/helpers/analytics/types'
import { getSession } from '@/helpers/oauth'
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
import {
	type AuthorizeResponse,
	type ExternalProvider,
	type LinkedAccount,
	type SyncResponse,
	type UnlinkResponse,
} from '@/typedefs/ExternalAccount'

// Constants
const API_URL = process.env.NEXT_PUBLIC_HAPPYVIEW_URL!
const CLIENT_KEY = process.env.NEXT_PUBLIC_HAPPYVIEW_CLIENT_KEY!

/**
 * Returns the current local date as a YYYYMMDD string based on the browser's timezone.
 */
export function getLocalNow(): string {
	const now = new Date()
	const y = now.getFullYear()
	const m = String(now.getMonth() + 1).padStart(2, '0')
	const d = String(now.getDate()).padStart(2, '0')
	return `${y}${m}${d}`
}

// ---------------------------------------------------------------------------
// Core
// ---------------------------------------------------------------------------

async function queryAPI(path: string, options: PentaractAPIQueryOptions = {}) {
	const { isAuthenticated = false, ...fetchOptions } = options
	const url = `${API_URL}${path}`
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		'x-client-key': CLIENT_KEY,
		...(fetchOptions.headers as Record<string, string>),
	}

	const session = getSession()

	if (isAuthenticated && !session) {
		throw new Error('No authenticated session')
	}

	if (session) {
		return session.fetchHandler(url, {
			...fetchOptions,
			headers,
		})
	}

	return fetch(url, {
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

/** Sort keys the endpoint accepts; anything else is rejected server-side. */
export type ListGamesSort = 'indexed_at' | 'createdAt' | 'name'

export type ListGamesOptions = {
	limit?: number
	cursor?: string
	sort?: ListGamesSort
	sortDirection?: 'asc' | 'desc'
	/**
	 * Restrict to one repo. **Omitting this returns games from every repo** —
	 * the endpoint does not fall back to the authenticated caller.
	 */
	did?: string
	/**
	 * Include the caller's own unpublished drafts. Requires `did` to be the
	 * caller's own DID and forces an authenticated request; the server rejects
	 * it otherwise.
	 */
	includeUnpublished?: boolean
}

export async function listGames(
	options: ListGamesOptions = {},
): Promise<{ cursor?: string; games: GameRecord[] }> {
	const {
		cursor,
		did,
		includeUnpublished,
		limit = 20,
		sort,
		sortDirection,
	} = options

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
	if (includeUnpublished) {
		params.set('includeUnpublished', 'true')
	}

	const response = await queryAPI(
		`/xrpc/games.gamesgamesgamesgames.listGames?${params}`,
		// Drafts are owner-only, so they need the session. A plain public listing
		// doesn't — auth is tied to what's being asked for, not to whether a
		// `did` filter happens to be present.
		{ isAuthenticated: Boolean(includeUnpublished) },
	)

	if (!response.ok) {
		const errorBody = await response.text()
		throw new Error(`listGames failed (${response.status}): ${errorBody}`)
	}

	return response.json()
}

export type GetGameQuery = (
	| { uri: string }
	| { slug: string }
	| { igdbId: string }
	| { steamId: string }
	| { gogId: string }
	| { epicGamesId: string }
	| { humbleBundleId: string }
	| { playStationId: string }
	| { xboxId: string }
	| { nintendoEshopId: string }
	| { appleAppStoreId: string }
	| { googlePlayId: string }
) & {
	includeOrgCredits?: boolean
	includeActorCredits?: boolean
}

export async function getGame(
	query: GetGameQuery,
): Promise<GameRecord | undefined> {
	const params = new URLSearchParams()
	for (const [key, value] of Object.entries(query)) {
		if (typeof value === 'boolean') {
			if (value) params.set(key, 'true')
		} else {
			params.set(key, value)
		}
	}
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

export type UserRole = 'superadmin' | 'admin'

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

export async function getCartridgeProfile(): Promise<
	PentaractAPIGetProfileResult & { roles: UserRole[] }
> {
	const response = await queryAPI(
		'/xrpc/dev.cartridge.actor.getProfile',
		{ isAuthenticated: true },
	)

	if (!response.ok) {
		return { profile: null, profileType: null, roles: [] }
	}

	return response.json()
}

export async function getVerificationStatus(
	handle: string,
): Promise<{ isVerified: boolean; accountType?: string }> {
	const params = new URLSearchParams({ handle })
	const response = await queryAPI(
		`/xrpc/dev.cartridge.getVerificationStatus?${params}`,
	)

	if (!response.ok) {
		return { isVerified: false }
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
		signal?: AbortSignal
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
		{ signal: options.signal },
	)

	// A failed search must not look like an empty one: callers show "no
	// results" for an empty list, so an error answer has to throw instead.
	if (!response.ok) {
		throw new SearchUnavailableError(`search answered ${response.status}`)
	}

	const body = (await response.json()) as Partial<PentaractAPISearchResult> | null
	if (!body || !Array.isArray(body.results)) {
		throw new SearchUnavailableError('search answered without results')
	}

	return body as PentaractAPISearchResult
}

/** Search could not be reached or answered with an error. */
export class SearchUnavailableError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'SearchUnavailableError'
	}
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
		throw new Error(`putActorProfile failed (${response.status}): ${errorBody}`)
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
		throw new Error(`putOrgProfile failed (${response.status}): ${errorBody}`)
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
	const resp = await queryAPI(
		`/xrpc/games.gamesgamesgamesgames.graph.getLikes?uri=${encodeURI(uri)}`,
	)

	if (!resp.ok) {
		return { count: 0, liked: false }
	}

	return resp.json()
}

export async function getLikeCount(
	did: string,
): Promise<{ count: number }> {
	const params = new URLSearchParams({ did })
	const resp = await queryAPI(
		`/xrpc/games.gamesgamesgamesgames.graph.getLikeCount?${params}`,
	)

	if (!resp.ok) {
		return { count: 0 }
	}

	return resp.json()
}

export async function getGameCount(
	did: string,
): Promise<{ count: number }> {
	const params = new URLSearchParams({ did })
	const resp = await queryAPI(
		`/xrpc/games.gamesgamesgamesgames.getGameCount?${params}`,
	)

	if (!resp.ok) {
		return { count: 0 }
	}

	return resp.json()
}

export async function getReviewCount(
	did: string,
): Promise<{ count: number }> {
	const params = new URLSearchParams({ did })
	const resp = await queryAPI(
		`/xrpc/games.gamesgamesgamesgames.getReviewCount?${params}`,
	)

	if (!resp.ok) {
		return { count: 0 }
	}

	return resp.json()
}

export async function getListCount(
	did: string,
): Promise<{ count: number }> {
	const params = new URLSearchParams({ did })
	const resp = await queryAPI(
		`/xrpc/games.gamesgamesgamesgames.getListCount?${params}`,
	)

	if (!resp.ok) {
		return { count: 0 }
	}

	return resp.json()
}

// ---------------------------------------------------------------------------
// Feeds
// ---------------------------------------------------------------------------

export type GameFeedGame = {
	uri: string
	name: string
	applicationType?: string
	summary?: string
	genres?: string[]
	themes?: string[]
	media?: GameRecord['media']
	releases?: GameRecord['releases']
	firstReleaseDate?: string
	slug?: string
	likeCount?: number
	weeklyLikes?: number
	weeklyReviews?: number
	weeklyListAdds?: number
}

export type GameFeedItem = {
	game: GameFeedGame
	feedContext?: string
}

export async function describeFeedGenerator(): Promise<{
	did: string
	feeds: Array<{ uri: string }>
}> {
	const resp = await queryAPI(
		'/xrpc/games.gamesgamesgamesgames.feed.describeFeedGenerator',
	)

	if (!resp.ok) {
		return { did: '', feeds: [] }
	}

	return resp.json()
}

export async function getGameFeed(
	feed: string,
	options: { feedContext?: string; limit?: number; cursor?: string } = {},
): Promise<{ feed: GameFeedItem[]; cursor?: string }> {
	const params = new URLSearchParams({ feed })
	if (options.feedContext) params.set('feedContext', options.feedContext)
	if (options.limit) params.set('limit', String(options.limit))
	if (options.cursor) params.set('cursor', options.cursor)

	const resp = await queryAPI(
		`/xrpc/games.gamesgamesgamesgames.feed.getGameFeed?${params}`,
	)

	if (!resp.ok) {
		return { feed: [] }
	}

	return resp.json()
}

export async function getSimilarGames(
	gameUri: string,
	limit = 10,
): Promise<GameFeedGame[]> {
	const params = new URLSearchParams({
		uri: gameUri,
		limit: String(limit),
	})

	const resp = await queryAPI(
		`/xrpc/games.gamesgamesgamesgames.feed.getSimilarGamesFeed?${params}`,
	)

	if (!resp.ok) {
		return []
	}

	const data = await resp.json()
	return (data.feed ?? []).map((item: GameFeedItem) => item.game)
}

export async function getHotGames(limit = 20): Promise<GameFeedGame[]> {
	const params = new URLSearchParams({ limit: String(limit) })

	const resp = await queryAPI(
		`/xrpc/games.gamesgamesgamesgames.feed.getHotGamesFeed?${params}`,
	)

	if (!resp.ok) {
		return []
	}

	const data = await resp.json()
	return (data.feed ?? []).map((item: GameFeedItem) => item.game)
}

export async function getRecentlyUpdatedGames(
	limit = 20,
): Promise<GameFeedGame[]> {
	const params = new URLSearchParams({ limit: String(limit) })

	const resp = await queryAPI(
		`/xrpc/games.gamesgamesgamesgames.feed.getRecentlyUpdatedFeed?${params}`,
	)

	if (!resp.ok) {
		return []
	}

	const data = await resp.json()
	return (data.feed ?? []).map((item: GameFeedItem) => item.game)
}

export async function getPersonalizedGames(
	limit = 20,
): Promise<GameFeedGame[]> {
	const params = new URLSearchParams({ limit: String(limit) })

	const resp = await queryAPI(
		`/xrpc/games.gamesgamesgamesgames.feed.getPersonalizedFeed?${params}`,
		{ isAuthenticated: true },
	)

	if (!resp.ok) {
		return []
	}

	const data = await resp.json()
	return (data.feed ?? []).map((item: GameFeedItem) => item.game)
}

export async function getUpcomingReleases(
	limit = 20,
	cursor?: string,
	now?: string,
	shuffle?: boolean,
	from?: number,
	to?: number,
): Promise<{ feed: GameFeedGame[]; cursor?: string; totalCount?: number }> {
	const params = new URLSearchParams({ limit: String(limit) })
	if (cursor) params.set('cursor', cursor)
	if (now) params.set('now', now)
	if (shuffle) params.set('shuffle', 'true')
	if (from !== undefined) params.set('from', String(from))
	if (to !== undefined) params.set('to', String(to))

	const resp = await queryAPI(
		`/xrpc/games.gamesgamesgamesgames.feed.getUpcomingReleasesFeed?${params}`,
	)

	if (!resp.ok) {
		return { feed: [] }
	}

	return resp.json()
}

export async function getRecentlyReleased(
	limit = 20,
	cursor?: string,
	now?: string,
): Promise<{ feed: GameFeedGame[]; cursor?: string }> {
	const params = new URLSearchParams({ limit: String(limit) })
	if (cursor) params.set('cursor', cursor)
	if (now) params.set('now', now)

	const resp = await queryAPI(
		`/xrpc/games.gamesgamesgamesgames.feed.getRecentlyReleasedFeed?${params}`,
	)

	if (!resp.ok) {
		return { feed: [] }
	}

	return resp.json()
}

export async function getLikedGames(
	did: string,
	limit = 50,
	cursor?: string,
): Promise<{ feed: GameFeedItem[]; cursor?: string }> {
	const params = new URLSearchParams({ did, limit: String(limit) })
	if (cursor) params.set('cursor', cursor)

	const resp = await queryAPI(
		`/xrpc/games.gamesgamesgamesgames.feed.getLikesFeed?${params}`,
	)

	if (!resp.ok) {
		return { feed: [] }
	}

	return resp.json()
}

export async function getPopularGames(
	limit: number = 20,
): Promise<{ games: GameFeedGame[] }> {
	const response = await queryAPI(
		`/xrpc/games.gamesgamesgamesgames.getPopularGames?limit=${limit}`,
	)

	if (!response.ok) {
		return { games: [] }
	}

	return response.json()
}

export type PlatformStats = {
	totalGames: number
	totalStudios: number
	totalReviews: number
}

export async function getStats(): Promise<PlatformStats | null> {
	const response = await queryAPI('/xrpc/games.gamesgamesgamesgames.getStats')

	if (!response.ok) {
		return null
	}

	return response.json()
}

export type GenreCountItem = {
	genre: string
	count: number
}

export async function getGenreCounts(): Promise<{ genres: GenreCountItem[] }> {
	const response = await queryAPI(
		'/xrpc/games.gamesgamesgamesgames.getGenreCounts',
	)

	if (!response.ok) {
		return { genres: [] }
	}

	return response.json()
}

export async function getGamesByGenre(
	genre: string,
	limit = 20,
): Promise<GameFeedGame[]> {
	const params = new URLSearchParams({ genre, limit: String(limit) })

	const resp = await queryAPI(
		`/xrpc/games.gamesgamesgamesgames.feed.getGamesByGenreFeed?${params}`,
	)

	if (!resp.ok) {
		return []
	}

	const data = await resp.json()
	return (data.feed ?? []).map((item: GameFeedItem) => item.game)
}

export async function getMostReviewedGames(
	limit = 20,
): Promise<GameFeedGame[]> {
	const params = new URLSearchParams({ limit: String(limit) })

	const resp = await queryAPI(
		`/xrpc/games.gamesgamesgamesgames.feed.getMostReviewedFeed?${params}`,
	)

	if (!resp.ok) {
		return []
	}

	const data = await resp.json()
	return (data.feed ?? []).map((item: GameFeedItem) => item.game)
}

export async function getMostListedGames(
	limit = 20,
): Promise<GameFeedGame[]> {
	const params = new URLSearchParams({ limit: String(limit) })

	const resp = await queryAPI(
		`/xrpc/games.gamesgamesgamesgames.feed.getMostListedFeed?${params}`,
	)

	if (!resp.ok) {
		return []
	}

	const data = await resp.json()
	return (data.feed ?? []).map((item: GameFeedItem) => item.game)
}

// ---------------------------------------------------------------------------
// Misc
// ---------------------------------------------------------------------------

export async function resolveHandle(handle: string): Promise<DID | null> {
	const cleaned = handle.replace(/^@/, '')
	try {
		const resp = await fetch(`https://${cleaned}/.well-known/atproto-did`)
		if (!resp.ok) return null
		const text = (await resp.text()).trim()
		if (text.startsWith('did:')) return text as DID
		return null
	} catch {
		return null
	}
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

// ---------------------------------------------------------------------------
// Claims
// ---------------------------------------------------------------------------

export type { ClaimView, ReviewView, GameSummaryView }

export async function createClaim(input: {
	type: 'game' | 'org'
	games?: string[]
	org?: string
	message?: string
	contact: string
}): Promise<string> {
	const response = await queryAPI(
		'/xrpc/dev.cartridge.claims.createClaim',
		{
			isAuthenticated: true,
			method: 'POST',
			body: JSON.stringify(input),
		},
	)

	if (!response.ok) {
		const status = response.status
		if (status === 401 || status === 403) {
			throw new Error('Your session has expired. Please sign in again and retry.')
		}
		if (status === 409) {
			throw new Error('A claim for this already exists. Check your existing claims or contact us if this seems wrong.')
		}
		if (status === 429) {
			throw new Error('Too many requests. Please wait a moment and try again.')
		}
		throw new Error('Something went wrong while submitting your claim. Please try again.')
	}

	const data = await response.json()
	return data.uri as string
}

export async function reviewClaim(input: {
	claim: { uri: string; cid: string }
	status: 'approved' | 'denied'
	approvedGames?: string[]
	reason?: string
}): Promise<string> {
	const response = await queryAPI(
		'/xrpc/dev.cartridge.claims.reviewClaim',
		{
			isAuthenticated: true,
			method: 'POST',
			body: JSON.stringify(input),
		},
	)

	if (!response.ok) {
		const errorBody = await response.text()
		throw new Error(`reviewClaim failed (${response.status}): ${errorBody}`)
	}

	const data = await response.json()
	return data.uri as string
}

export async function migrateClaim(input: {
	claim: string
	claimReview: string
}): Promise<{ jobId: string; status: string; gamesCount: number }> {
	const response = await queryAPI(
		'/xrpc/dev.cartridge.claims.migrateClaim',
		{
			isAuthenticated: true,
			method: 'POST',
			body: JSON.stringify(input),
		},
	)

	if (!response.ok) {
		const errorBody = await response.text()
		throw new Error(`migrateClaim failed (${response.status}): ${errorBody}`)
	}

	return response.json()
}

export interface MigrationJobStatus {
	jobId: string
	status: 'pending' | 'running' | 'completed' | 'failed' | 'paused' | 'cancelled'
	progress?: {
		total?: number
		processed?: number
		orgProfileDone?: boolean
	}
	results?: Array<{
		gameUri: string
		status: 'success' | 'failed' | 'skipped'
		newUri?: string
		error?: string
	}>
	error?: string
}

export async function getMigrationStatus(jobId: string): Promise<MigrationJobStatus> {
	const response = await queryAPI(
		`/xrpc/dev.cartridge.claims.getMigrationStatus?jobId=${encodeURIComponent(jobId)}`,
		{ isAuthenticated: true },
	)

	if (!response.ok) {
		const errorBody = await response.text()
		throw new Error(`getMigrationStatus failed (${response.status}): ${errorBody}`)
	}

	return response.json()
}

export async function getClaim(uri: string): Promise<ClaimView | null> {
	const response = await queryAPI(
		`/xrpc/dev.cartridge.claims.getClaim?uri=${encodeURI(uri)}`,
		{ isAuthenticated: true },
	)

	if (!response.ok) {
		return null
	}

	const data = await response.json()
	return data.claim as ClaimView
}

export async function listClaims(options?: {
	status?: 'pending' | 'approved' | 'denied'
	limit?: number
	cursor?: string
}): Promise<{ claims: ClaimView[]; cursor?: string }> {
	const params = new URLSearchParams()
	if (options?.status) params.set('status', options.status)
	if (options?.limit) params.set('limit', String(options.limit))
	if (options?.cursor) params.set('cursor', options.cursor)

	const response = await queryAPI(
		`/xrpc/dev.cartridge.claims.listClaims?${params}`,
		{ isAuthenticated: true },
	)

	if (!response.ok) {
		return { claims: [] }
	}

	return response.json()
}

export async function createSpace(input: {
	type: string
	skey: string
	config?: Record<string, unknown>
}): Promise<{ uri: string }> {
	const response = await queryAPI(
		'/xrpc/com.atproto.simplespace.createSpace',
		{
			isAuthenticated: true,
			method: 'POST',
			body: JSON.stringify(input),
		},
	)

	if (!response.ok) {
		const errorBody = await response.text()
		throw new Error(`createSpace failed (${response.status}): ${errorBody}`)
	}

	return response.json()
}

export interface SpaceMember {
	did: string
	access: string
}

export async function listSpaceMembers(
	spaceUri: string,
): Promise<{ members: SpaceMember[] }> {
	const params = new URLSearchParams({ space: spaceUri })
	const response = await queryAPI(
		`/xrpc/com.atproto.simplespace.listMembers?${params}`,
		{ isAuthenticated: true },
	)

	if (!response.ok) {
		const errorBody = await response.text()
		throw new Error(`listSpaceMembers failed (${response.status}): ${errorBody}`)
	}

	return response.json()
}

export async function addSpaceMember(
	spaceUri: string,
	did: string,
	access = 'write',
): Promise<void> {
	const response = await queryAPI(
		'/xrpc/com.atproto.simplespace.addMember',
		{
			isAuthenticated: true,
			method: 'POST',
			body: JSON.stringify({ space: spaceUri, did, access }),
		},
	)

	if (!response.ok) {
		const errorBody = await response.text()
		throw new Error(`addSpaceMember failed (${response.status}): ${errorBody}`)
	}
}

export async function removeSpaceMember(
	spaceUri: string,
	did: string,
): Promise<void> {
	const response = await queryAPI(
		'/xrpc/com.atproto.simplespace.removeMember',
		{
			isAuthenticated: true,
			method: 'POST',
			body: JSON.stringify({ space: spaceUri, did }),
		},
	)

	if (!response.ok) {
		const errorBody = await response.text()
		throw new Error(`removeSpaceMember failed (${response.status}): ${errorBody}`)
	}
}

export async function listOrgGames(
	org: string,
	options?: { limit?: number; cursor?: string },
): Promise<{ games: GameSummaryView[]; cursor?: string }> {
	const params = new URLSearchParams({ org })
	if (options?.limit) params.set('limit', String(options.limit))
	if (options?.cursor) params.set('cursor', options.cursor)

	const response = await queryAPI(
		`/xrpc/games.gamesgamesgamesgames.listOrgGames?${params}`,
		{ isAuthenticated: true },
	)

	if (!response.ok) {
		return { games: [] }
	}

	return response.json()
}

export async function getOrgDevelopedFeed(
	org: string,
	options?: { limit?: number; cursor?: string },
): Promise<{ feed: GameFeedItem[]; cursor?: string; totalCount?: number }> {
	const params = new URLSearchParams({ org })
	if (options?.limit) params.set('limit', String(options.limit))
	if (options?.cursor) params.set('cursor', options.cursor)

	const response = await queryAPI(
		`/xrpc/games.gamesgamesgamesgames.feed.getOrgDevelopedFeed?${params}`,
	)

	if (!response.ok) {
		return { feed: [] }
	}

	return response.json()
}

export async function getOrgPublishedFeed(
	org: string,
	options?: { limit?: number; cursor?: string },
): Promise<{ feed: GameFeedItem[]; cursor?: string; totalCount?: number }> {
	const params = new URLSearchParams({ org })
	if (options?.limit) params.set('limit', String(options.limit))
	if (options?.cursor) params.set('cursor', options.cursor)

	const response = await queryAPI(
		`/xrpc/games.gamesgamesgamesgames.feed.getOrgPublishedFeed?${params}`,
	)

	if (!response.ok) {
		return { feed: [] }
	}

	return response.json()
}

// ---------------------------------------------------------------------------
// Activity Feed
// ---------------------------------------------------------------------------

export type ActivityReviewView = {
	uri: string
	rating: number
	text?: string
	title?: string
	tags?: string[]
	containsSpoilers?: boolean
	createdAt: string
}

export type ActivityListView = {
	uri: string
	name: string
	createdAt: string
}

export type ActivityFeedItem = {
	type: 'like' | 'review' | 'listCreate' | 'listAddGame'
	createdAt: string
	game?: GameFeedGame
	review?: ActivityReviewView
	list?: ActivityListView
}

export type CommunityFeedActorView = {
	did: string
	handle?: string
	displayName?: string
}

export type CommunityFeedItem = {
	type: 'like' | 'review' | 'listCreate' | 'listAddGame'
	createdAt: string
	actor: CommunityFeedActorView
	game?: GameFeedGame
	review?: ActivityReviewView
	list?: ActivityListView
}

export async function getCommunityFeed(
	limit = 20,
	cursor?: string,
): Promise<{ feed: CommunityFeedItem[]; cursor?: string }> {
	const params = new URLSearchParams({ limit: String(limit) })
	if (cursor) params.set('cursor', cursor)

	const resp = await queryAPI(
		`/xrpc/games.gamesgamesgamesgames.feed.getCommunityFeed?${params}`,
	)

	if (!resp.ok) {
		return { feed: [] }
	}

	return resp.json()
}

export async function getActivityFeed(
	did: string,
	limit = 30,
	cursor?: string,
): Promise<{ feed: ActivityFeedItem[]; cursor?: string }> {
	const params = new URLSearchParams({ did, limit: String(limit) })
	if (cursor) params.set('cursor', cursor)

	const resp = await queryAPI(
		`/xrpc/games.gamesgamesgamesgames.feed.getActivityFeed?${params}`,
	)

	if (!resp.ok) {
		return { feed: [] }
	}

	return resp.json()
}

// ---------------------------------------------------------------------------
// User Lists
// ---------------------------------------------------------------------------

export type ListPreviewItem = {
	uri: string
	name: string
	slug?: string
	media?: GameRecord['media']
}

export type UserListView = {
	uri: string
	name: string
	description?: string
	itemCount: number
	hasGame?: boolean
	createdAt: string
	previewItems?: ListPreviewItem[]
}

export async function getUserLists(
	did: string,
	gameUri?: string,
): Promise<{ lists: UserListView[]; cursor?: string }> {
	const params = new URLSearchParams({ did })
	if (gameUri) params.set('gameUri', gameUri)

	const resp = await queryAPI(
		`/xrpc/games.gamesgamesgamesgames.getUserLists?${params}`,
	)

	if (!resp.ok) {
		return { lists: [] }
	}

	return resp.json()
}

export async function createList(
	name: string,
	description?: string,
): Promise<{ uri: string; cid: string }> {
	const body: Record<string, string> = { name }
	if (description) body.description = description

	const response = await queryAPI(
		'/xrpc/games.gamesgamesgamesgames.createList',
		{
			isAuthenticated: true,
			method: 'POST',
			body: JSON.stringify(body),
		},
	)

	if (!response.ok) {
		const errorBody = await response.text()
		throw new Error(`createList failed (${response.status}): ${errorBody}`)
	}

	return response.json()
}

export async function toggleListItem(
	listUri: string,
	gameUri: string,
): Promise<{ uri?: string; cid?: string; action: 'added' | 'removed' }> {
	const response = await queryAPI(
		'/xrpc/games.gamesgamesgamesgames.toggleListItem',
		{
			isAuthenticated: true,
			method: 'POST',
			body: JSON.stringify({ listUri, gameUri }),
		},
	)

	if (!response.ok) {
		const errorBody = await response.text()
		throw new Error(`toggleListItem failed (${response.status}): ${errorBody}`)
	}

	return response.json()
}

// ---------------------------------------------------------------------------
// List detail
// ---------------------------------------------------------------------------

export type ListCreatorView = {
	did: string
	handle: string
	displayName?: string
	avatar?: unknown
}

export type ListDetailView = {
	uri: string
	name: string
	description?: string
	itemCount: number
	createdAt: string
	creator: ListCreatorView
}

export type ListItemView = {
	uri: string
	addedAt: string
	game: GameFeedGame
}

export async function getList(
	uri: string,
): Promise<{ list: ListDetailView } | null> {
	const resp = await queryAPI(
		`/xrpc/games.gamesgamesgamesgames.feed.getList?uri=${encodeURI(uri)}`,
	)

	if (!resp.ok) {
		return null
	}

	return resp.json()
}

export async function getListItems(
	listUri: string,
	limit = 30,
	cursor?: string,
): Promise<{ items: ListItemView[]; cursor?: string }> {
	const params = new URLSearchParams({ listUri, limit: String(limit) })
	if (cursor) params.set('cursor', cursor)

	const resp = await queryAPI(
		`/xrpc/games.gamesgamesgamesgames.feed.getListItems?${params}`,
	)

	if (!resp.ok) {
		return { items: [] }
	}

	return resp.json()
}

// ---------------------------------------------------------------------------
// Contributions
// ---------------------------------------------------------------------------

export type { ContributionView, ContributionStats, Badge }

export async function createContribution(input: {
	subject?: string
	contributionType: 'correction' | 'addition' | 'newGame'
	changes: Record<string, unknown>
	message?: string
}): Promise<string> {
	const response = await queryAPI(
		'/xrpc/games.gamesgamesgamesgames.createContribution',
		{
			isAuthenticated: true,
			method: 'POST',
			body: JSON.stringify(input),
		},
	)

	if (!response.ok) {
		const errorBody = await response.text()
		throw new Error(
			`createContribution failed (${response.status}): ${errorBody}`,
		)
	}

	const data = await response.json()
	return data.uri as string
}

export async function reviewContribution(input: {
	contribution: { uri: string; cid: string }
	status: 'approved' | 'denied' | 'needsRevision'
	reason?: string
}): Promise<string> {
	const response = await queryAPI(
		'/xrpc/games.gamesgamesgamesgames.reviewContribution',
		{
			isAuthenticated: true,
			method: 'POST',
			body: JSON.stringify(input),
		},
	)

	if (!response.ok) {
		const errorBody = await response.text()
		throw new Error(
			`reviewContribution failed (${response.status}): ${errorBody}`,
		)
	}

	const data = await response.json()
	return data.uri as string
}

export async function acceptContribution(input: {
	contributionPatch: string
}): Promise<string> {
	const response = await queryAPI(
		'/xrpc/games.gamesgamesgamesgames.acceptContribution',
		{
			isAuthenticated: true,
			method: 'POST',
			body: JSON.stringify(input),
		},
	)

	if (!response.ok) {
		const errorBody = await response.text()
		throw new Error(
			`acceptContribution failed (${response.status}): ${errorBody}`,
		)
	}

	const data = await response.json()
	return data.uri as string
}

export async function getContribution(
	uri: string,
): Promise<ContributionView | null> {
	const response = await queryAPI(
		`/xrpc/games.gamesgamesgamesgames.getContribution?uri=${encodeURI(uri)}`,
	)

	if (!response.ok) {
		return null
	}

	const data = await response.json()
	return data.contribution as ContributionView
}

export async function listContributions(options?: {
	status?: 'pending' | 'approved' | 'denied' | 'needsRevision'
	subject?: string
	contributor?: string
	limit?: number
	cursor?: string
}): Promise<{ contributions: ContributionView[]; cursor?: string }> {
	const params = new URLSearchParams()
	if (options?.status) params.set('status', options.status)
	if (options?.subject) params.set('subject', options.subject)
	if (options?.contributor) params.set('contributor', options.contributor)
	if (options?.limit) params.set('limit', String(options.limit))
	if (options?.cursor) params.set('cursor', options.cursor)

	const response = await queryAPI(
		`/xrpc/games.gamesgamesgamesgames.listContributions?${params}`,
		{ isAuthenticated: true },
	)

	if (!response.ok) {
		return { contributions: [] }
	}

	return response.json()
}

export async function getContributionStats(
	did: string,
): Promise<{ stats: ContributionStats; badges: Badge[] } | null> {
	const params = new URLSearchParams({ did })
	const response = await queryAPI(
		`/xrpc/games.gamesgamesgamesgames.getContributionStats?${params}`,
	)

	if (!response.ok) {
		return null
	}

	return response.json()
}

// ---------------------------------------------------------------------------
// External Auth
// ---------------------------------------------------------------------------

export async function getExternalProviders(): Promise<ExternalProvider[]> {
	const response = await queryAPI('/external-auth/providers')

	if (!response.ok) {
		return []
	}

	return response.json()
}

export async function getLinkedAccounts(): Promise<LinkedAccount[]> {
	const response = await queryAPI('/external-auth/accounts', {
		isAuthenticated: true,
	})

	if (!response.ok) {
		return []
	}

	return response.json()
}

export async function authorizeExternal(
	pluginId: string,
	redirectUri: string,
): Promise<AuthorizeResponse> {
	const params = new URLSearchParams({ redirect_uri: redirectUri })
	const response = await queryAPI(
		`/external-auth/${pluginId}/authorize?${params}`,
		{ isAuthenticated: true },
	)

	if (!response.ok) {
		const errorBody = await response.text()
		throw new Error(
			`authorizeExternal failed (${response.status}): ${errorBody}`,
		)
	}

	return response.json()
}

export async function syncExternal(pluginId: string): Promise<SyncResponse> {
	const response = await queryAPI(`/external-auth/${pluginId}/sync`, {
		isAuthenticated: true,
		method: 'POST',
	})

	if (!response.ok) {
		const errorBody = await response.text()
		throw new Error(`syncExternal failed (${response.status}): ${errorBody}`)
	}

	return response.json()
}

export async function unlinkExternal(
	pluginId: string,
): Promise<UnlinkResponse> {
	const response = await queryAPI(`/external-auth/${pluginId}/unlink`, {
		isAuthenticated: true,
		method: 'POST',
	})

	if (!response.ok) {
		const errorBody = await response.text()
		throw new Error(`unlinkExternal failed (${response.status}): ${errorBody}`)
	}

	return response.json()
}

// ---------------------------------------------------------------------------
// Follow
// ---------------------------------------------------------------------------

export async function toggleFollow(
	did: string,
): Promise<{ action: 'followed' | 'unfollowed' }> {
	const response = await queryAPI(
		'/xrpc/games.gamesgamesgamesgames.graph.toggleFollow',
		{
			isAuthenticated: true,
			method: 'POST',
			body: JSON.stringify({ subject: did }),
		},
	)

	if (!response.ok) {
		throw new Error(`toggleFollow failed (${response.status})`)
	}

	return response.json()
}

export async function getFollowerCount(
	did: string,
): Promise<{ count: number }> {
	const resp = await queryAPI(
		`/xrpc/games.gamesgamesgamesgames.graph.getFollowerCount?did=${did}`,
	)

	if (!resp.ok) return { count: 0 }
	return resp.json()
}

export async function getFollowingCount(
	did: string,
): Promise<{ count: number }> {
	const resp = await queryAPI(
		`/xrpc/games.gamesgamesgamesgames.graph.getFollowingCount?did=${did}`,
	)

	if (!resp.ok) return { count: 0 }
	return resp.json()
}

export async function getFollowStatus(
	did: string,
): Promise<{ isFollowing: boolean; isFollowedBy: boolean }> {
	const resp = await queryAPI(
		`/xrpc/games.gamesgamesgamesgames.graph.getFollowStatus?did=${did}`,
		{ isAuthenticated: true },
	)

	if (!resp.ok) return { isFollowing: false, isFollowedBy: false }
	return resp.json()
}

// ---------------------------------------------------------------------------
// Taste
// ---------------------------------------------------------------------------

export type GenrePreference = {
	genre: string
	count: number
	percentage: number
}

export type TasteProfile = {
	genres: GenrePreference[]
	favorites: GameFeedGame[]
}

export async function getTasteProfile(
	did: string,
	genreLimit = 5,
	favoriteLimit = 6,
): Promise<TasteProfile> {
	const queryParams = new URLSearchParams({
		did,
		genreLimit: String(genreLimit),
		favoriteLimit: String(favoriteLimit),
	})

	const resp = await queryAPI(
		`/xrpc/games.gamesgamesgamesgames.actor.getTasteProfile?${queryParams}`,
	)

	if (!resp.ok) {
		return { genres: [], favorites: [] }
	}

	return resp.json()
}

// ---------------------------------------------------------------------------
// Verification
// ---------------------------------------------------------------------------

export interface VerificationRequestView {
	id: string
	requesterDid: string
	accountType: AccountType
	message: string
	contact?: string
	status: 'pending' | 'approved' | 'denied'
	reviewReason?: string
	reviewedBy?: string
	reviewedAt?: string
	createdAt: string
}

export async function createVerificationRequest(input: {
	accountType: AccountType
	message: string
	contact: string
}): Promise<string> {
	const response = await queryAPI(
		'/xrpc/dev.cartridge.createVerificationRequest',
		{
			isAuthenticated: true,
			method: 'POST',
			body: JSON.stringify(input),
		},
	)

	if (!response.ok) {
		const errorBody = await response.text()
		throw new Error(`createVerificationRequest failed (${response.status}): ${errorBody}`)
	}

	const data = await response.json()
	return data.id as string
}

export async function getVerificationRequest(options?: {
	id?: string
	requesterDid?: string
}): Promise<VerificationRequestView | null> {
	const params = new URLSearchParams()
	if (options?.id) params.set('id', options.id)
	if (options?.requesterDid) params.set('requesterDid', options.requesterDid)

	const response = await queryAPI(
		`/xrpc/dev.cartridge.getVerificationRequest?${params}`,
		{ isAuthenticated: true },
	)

	if (!response.ok) {
		return null
	}

	const data = await response.json()
	return data.request as VerificationRequestView
}

export async function listVerificationRequests(options?: {
	status?: 'pending' | 'approved' | 'denied'
	limit?: number
	cursor?: string
}): Promise<{ requests: VerificationRequestView[]; cursor?: string }> {
	const params = new URLSearchParams()
	if (options?.status) params.set('status', options.status)
	if (options?.limit) params.set('limit', String(options.limit))
	if (options?.cursor) params.set('cursor', options.cursor)

	const response = await queryAPI(
		`/xrpc/dev.cartridge.listVerificationRequests?${params}`,
		{ isAuthenticated: true },
	)

	if (!response.ok) {
		return { requests: [] }
	}

	return response.json()
}

export async function reviewVerificationRequest(input: {
	requestId: string
	status: 'approved' | 'denied'
	reason?: string
}): Promise<{ requestId: string; verificationUri?: string }> {
	const response = await queryAPI(
		'/xrpc/dev.cartridge.reviewVerificationRequest',
		{
			isAuthenticated: true,
			method: 'POST',
			body: JSON.stringify(input),
		},
	)

	if (!response.ok) {
		const errorBody = await response.text()
		throw new Error(`reviewVerificationRequest failed (${response.status}): ${errorBody}`)
	}

	return response.json()
}

// ---------------------------------------------------------------------------
// Analytics (owner-facing)
// ---------------------------------------------------------------------------

/**
 * Per-game analytics for the owner dashboard. Backed by the HappyView Lua
 * read-proxy, which verifies the caller owns the game before returning data.
 */
export async function getGameAnalytics(
	slug: string,
	range: AnalyticsRange = '30d',
): Promise<GameAnalytics | null> {
	const params = new URLSearchParams({ slug, range })
	const response = await queryAPI(
		`/xrpc/dev.cartridge.analytics.getGameAnalytics?${params}`,
		{ isAuthenticated: true },
	)

	if (!response.ok) {
		return null
	}

	return response.json()
}

/** Headline analytics for every game the caller owns (dashboard overview). */
export async function listMyGamesAnalytics(
	range: AnalyticsRange = '30d',
): Promise<MyGamesAnalytics> {
	const params = new URLSearchParams({ range })
	const response = await queryAPI(
		`/xrpc/dev.cartridge.analytics.listMyGamesAnalytics?${params}`,
		{ isAuthenticated: true },
	)

	if (!response.ok) {
		return { range, games: [] }
	}

	return response.json()
}
