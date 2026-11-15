import { cache } from 'react'

import * as API from '@/helpers/API'
import { gameUriFromParam } from '@/helpers/gameRoute'

/**
 * Resolves a /game/[slug] parameter: by slug first, then, when the parameter
 * is a catalogue record key or an encoded game URI, by record. `viaRecord`
 * says the second path found it, so the page can send a game that has a slug
 * to its slug URL. Cached per request: the layout, page, metadata and image
 * all ask for the same game.
 *
 * A failure to load (as opposed to "no such game") throws, as getGame does.
 */
export const loadGameForRoute = cache(async (param: string) => {
	const options = { includeOrgCredits: true, includeActorCredits: true }

	const bySlug = await API.getGame({ slug: param, ...options })
	if (bySlug) return { game: bySlug, viaRecord: false }

	const uri = gameUriFromParam(param)
	if (!uri) return { game: undefined, viaRecord: false }

	const byUri = await API.getGame({ uri, ...options })
	return { game: byUri, viaRecord: byUri !== undefined }
})
