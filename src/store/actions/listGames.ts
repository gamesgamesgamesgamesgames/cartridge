// Local imports
import * as API from '@/helpers/API'
import { type Game } from '@/typedefs/Game'
import { store } from '@/store/store'

/**
 * Page size for the studio catalog.
 *
 * Deliberately the endpoint's maximum: the catalog filters and sorts on the
 * client, so a small page would silently narrow those controls to whichever
 * slice happened to be loaded. Most studios fit in a single page.
 */
export const CATALOG_PAGE_SIZE = 100

/**
 * Load the next page of the signed-in user's games into the catalog.
 *
 * `games.gamesgamesgamesgames.listGames` documents itself as "a list of games
 * on the network" and treats `did` as an optional filter with **no fallback to
 * the authenticated caller**. Omitting it returns everyone's games. The studio
 * catalog is an owner surface, so the DID is required here, not optional.
 *
 * Rejects on failure; the caller owns the error state.
 */
export async function listGames() {
	const { gamesCatalogCursor, user } = store.state

	if (!user?.did) {
		throw new Error('Cannot list catalog games without a signed-in user')
	}

	const data = await API.listGames({
		limit: CATALOG_PAGE_SIZE,
		cursor: gamesCatalogCursor ?? undefined,
		did: user.did,
		// A studio's own drafts belong in its own catalog; without this the
		// endpoint filters to `publishedAt IS NOT NULL` and an unpublished game
		// is indistinguishable from one that never saved.
		includeUnpublished: true,
	})

	const newGames: Game[] = data.games.map((record) => ({
		isHydrated: false,
		record,
	}))

	const { gamesCatalog: existingGames } = store.state

	// Merge by URI rather than appending blindly. Two loads that start before
	// either finishes read the same cursor and fetch the same page, so a plain
	// append would list every game twice — and duplicate React keys with it.
	// The catalog is a set of records; treat it as one.
	const seen = new Set(existingGames?.map((game) => game.record.uri))

	store.set({
		gamesCatalog: [
			...(existingGames ?? []),
			...newGames.filter((game) => !seen.has(game.record.uri)),
		],
		gamesCatalogCursor: data.cursor ?? null,
		gamesCatalogHasNextPage: Boolean(data.cursor),
	})
}
