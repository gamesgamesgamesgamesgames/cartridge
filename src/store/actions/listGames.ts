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
				first: 25
				after: $cursor
				sortBy: [{ field: name, direction: DESC }]
			) {
				edges {
					node {
						uri
						did
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

	store.set((previousState) => {
		const newCatalog = [...(previousState.gamesCatalog || [])]

		edges.forEach(({ node }) => {
			const index = newCatalog.findIndex(
				(catalogItem) => catalogItem.record.uri === node.uri,
			)

			if (index !== -1) {
				newCatalog[index] = {
					isHydrated: false,
					record: node,
				}
			} else {
				newCatalog.push({
					isHydrated: false,
					record: node,
				})
			}
		})

		return {
			gamesCatalog: newCatalog,
			gamesCatalogCursor: pageInfo.endCursor,
			gamesCatalogHasNextPage: pageInfo.hasNextPage,
		}
	})
}
