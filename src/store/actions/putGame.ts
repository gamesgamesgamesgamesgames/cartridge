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

	const mutationVariables: UnpublishedGame & {
		publishedAt?: string
		rkey: string
	} = { 
		...gameDetails,
		rkey,
	}

	const timestamp = (new Date()).toISOString()

	if (shouldPublish) {
		mutationVariables.publishedAt = timestamp
	}

	const result = await quicksliceClient.mutate<{
		gamesGamesgamesgamesgamesGame: {
			edges: []
		}
	}>(
		`
		mutation PutGame (
			$rkey: String!
			$createdAt: DateTime!
			$publishedAt: DateTime!
			$applicationType: String!,
			$genres: [String!],
			$modes: [String!],
			$name: String!,
			$playerPerspectives: [String!],
			$summary: String,
			$themes: [String!],
		) {
			updateGamesGamesgamesgamesgamesGame (
				rkey: $rkey
				input:  {
					createdAt: $createdAt
					publishedAt: $publishedAt
					applicationType: $applicationType
					genres: $genres
					modes: $modes
					name: $name
					playerPerspectives: $playerPerspectives
					summary: $summary
					themes: $themes
				}
			) {
				uri
			}
		}
		`,
		mutationVariables,
	)

	return result
}
