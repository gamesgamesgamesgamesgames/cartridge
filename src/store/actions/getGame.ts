// Local imports
import { type GameRecord } from '@/typedefs/GameRecord'
import { store } from '@/store/store'

export async function getGame(uri: string) {
	const { quicksliceClient } = store.state

	if (!quicksliceClient) {
		throw new Error('Cannot retrieve game data before logging in.')
	}

	const result = await quicksliceClient.query<{
		gamesGamesgamesgamesgamesGame: {
			edges: {
				node: GameRecord
			}[]
		}
	}>(
		`
		query GetGame ($uri: String!) {
			gamesGamesgamesgamesgamesGame(
				where: {
					uri: {
						eq: $uri
					}
				}
			) {
				edges {
					node {
						uri
						did
						applicationType
						createdAt
						genres
						media {
							blob {
								ref
								mimeType
								size
								url
							}
							description
							height
							locale
							mediaType
							title
							width
						}
						modes
						name
						playerPerspectives
						publishedAt
						releases {
							platform
							releaseDates {
								region
								releasedAt
								releasedAtFormat
								status
							}
						}
						summary
						themes
					}
				}
			}
		}
		`,
		{ uri },
	)

	const game = {
		isHydrated: true,
		record: result.gamesGamesgamesgamesgamesGame.edges[0]?.node,
	}

	if (!game.record) {
		const game = store.state.gamesCatalog?.find(
			(game) => game.record.uri === uri,
		)

		if (game) {
			return {
				...game,
				isHydrated: true,
			}
		}

		return game
	}

	store.set((previousState) => {
		const newCatalog = [...(previousState.gamesCatalog ?? [])]

		const gameIndex = newCatalog.findIndex(
			(catalogGame) => catalogGame.record.uri === game.record.uri,
		)

		if (gameIndex !== -1) {
			newCatalog[gameIndex] = game
		} else {
			newCatalog.push(game)
		}

		return { gamesCatalog: previousState.gamesCatalog }
	})

	return game
}
