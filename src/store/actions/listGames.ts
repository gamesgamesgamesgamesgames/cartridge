// Local imports
import { type GameRecord } from '@/typedefs/GameRecord'
import { store } from '@/store/store'

export async function listGames() {
	const { gamesCatalogCursor, quicksliceClient } = store.state

	if (!quicksliceClient) {
		throw new Error('Cannot list games before logging in.')
	}

	const result = await quicksliceClient.query<{
		gamesGamesgamesgamesgamesGame: {
			edges: {
				node: GameRecord
			}[]
			pageInfo: {
				endCursor: null | string
				hasNextPage: boolean
			}
		}
	}>(
		`
		query ListGames ($cursor: String) {
			gamesGamesgamesgamesgamesGame(
				first: 20
				after: $cursor
				sortBy: [{ field: name, direction: DESC }]
			) {
				edges {
					node {
						uri
						name
					}
				}
				pageInfo {
					hasNextPage
					endCursor
				}
			}
		}
		`,
		{ cursor: gamesCatalogCursor },
	)

	const { edges, pageInfo } = result.gamesGamesgamesgamesgamesGame

	store.set((previousState) => ({
		gamesCatalog: [
			...(previousState.gamesCatalog || []),
			...edges.map((edge) => ({
				isHydrated: false,
				record: edge.node,
			})),
		],
		gamesCatalogCursor: pageInfo.endCursor,
		gamesCatalogHasNextPage: pageInfo.hasNextPage,
	}))
}
