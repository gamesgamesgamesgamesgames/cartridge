// Module imports
import { type AtUriString } from '@atproto/lex'

// Local imports
import { parseATURI } from '@/helpers/parseATURI'
import { store } from '@/store/store'
import { type UnpublishedGame } from '@/typedefs/UnpublishedGame'

// Types
type Options = { shouldPublish?: boolean }

export async function putGame(uri: AtUriString, gameDetails: UnpublishedGame, options: Options = {}) {
	const { shouldPublish } = options

	const { quicksliceClient } = store.state

	if (!quicksliceClient) {
		throw new Error('Cannot save games before logging in.')
	}

	const { rkey } = parseATURI(uri)

	const input: UnpublishedGame & {
		publishedAt?: string
	} = {
		...gameDetails,
		media: gameDetails.media.map((mediaItem) => {
			const { file: _file, id: _id, ...cleanedMediaItem } = mediaItem
			return cleanedMediaItem
		}),
		releases: gameDetails.releases?.map((release) => {
			const { id: _releaseId, ...releaseWithoutId } = release as typeof release & { id?: string }
			return {
				...releaseWithoutId,
				releaseDates: release.releaseDates?.map((rd) => {
					const { id: _rdId, ...rdWithoutId } = rd as typeof rd & { id?: string }
					return rdWithoutId
				}),
			}
		}),
	}

	if (shouldPublish) {
		input.publishedAt = new Date().toISOString()
	}

	const result = await quicksliceClient.mutate<{
		updateGamesGamesgamesgamesgamesGame: {
			uri: AtUriString
		}
	}>(
		`
		mutation PutGame ($rkey: String!, $input: GamesGamesgamesgamesgamesGameInput!) {
			updateGamesGamesgamesgamesgamesGame (rkey: $rkey, input: $input) {
				uri
			}
		}
		`,
		{ rkey, input },
	)

	return result.updateGamesGamesgamesgamesgamesGame.uri
}
