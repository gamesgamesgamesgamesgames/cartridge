// Module imports
import { type AtUriString } from '@atproto/lex'

// Local imports
import { store } from '@/store/store'
import { UnpublishedGame } from '@/typedefs/UnpublishedGame'

// Types
type Options = {
	shouldPublish?: boolean
}

export async function createGame(
	gameDetails: UnpublishedGame,
	options: Options = {},
) {
	const { shouldPublish } = options

	const { quicksliceClient } = store.state

	if (!quicksliceClient) {
		throw new Error('Cannot list games before logging in.')
	}

	const timestamp = new Date().toISOString()

	const input: UnpublishedGame & {
		createdAt?: string
		publishedAt?: string
	} = {
		...gameDetails,
		createdAt: timestamp,
		media: gameDetails.media.map((mediaItem) => {
			const { file: _file, id: _id, ...cleanedMediaItem } = mediaItem
			return cleanedMediaItem
		}),
		// Strip internal IDs from releases before sending to API
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
		input.publishedAt = timestamp
	}

	const result = await quicksliceClient.mutate<{
		createGamesGamesgamesgamesgamesGame: {
			uri: AtUriString
		}
	}>(
		`
		mutation CreateGame ($input: GamesGamesgamesgamesgamesGameInput!) {
			createGamesGamesgamesgamesgamesGame (input: $input) {
				uri
			}
		}
		`,
		{ input },
	)

	return result.createGamesGamesgamesgamesgamesGame.uri
}
