// Module imports
import { type AtUriString } from '@atproto/lex'

// Local imports
import { store } from '@/store/store'
import { UnpublishedGame } from '@/typedefs/UnpublishedGame'

// Types
type Options = {
	shouldPublish?: boolean
}

export async function createGame(gameDetails: UnpublishedGame, options: Options = {}) {
	const { shouldPublish } = options

	const { quicksliceClient } = store.state

	if (!quicksliceClient) {
		throw new Error('Cannot list games before logging in.')
	}

	const timestamp = (new Date()).toISOString()

	const mutationVariables: UnpublishedGame & {
		createdAt?: string,
		publishedAt?: string
	} = { 
		...gameDetails,
		createdAt: timestamp,
	}

	if (shouldPublish) {
		mutationVariables.publishedAt = timestamp
	}

	const result = await quicksliceClient.mutate<{
		createGamesGamesgamesgamesgamesGame: {
			uri: AtUriString
		}
	}>(
		`
		mutation CreateGame (
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
			createGamesGamesgamesgamesgamesGame (
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

	console.log({result})
	return result.createGamesGamesgamesgamesgamesGame.uri
}
