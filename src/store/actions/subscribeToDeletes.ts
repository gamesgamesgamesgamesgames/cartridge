// Module imports
import { type Client } from 'graphql-ws'

// Local imports
import { type ATURI } from '@/typedefs/ATURI'
import { type GameRecord } from '@/typedefs/GameRecord'
import { store } from '@/store/store'

export async function subscribeToDeletes(client: Client) {
	const subscription = client.iterate<{
		gamesGamesgamesgamesgamesGameUpdated: { uri: ATURI }
	}>({
		query: `
			subscription {
				gamesGamesgamesgamesgamesGameUpdated {
					uri
				}
			}
		`,
	})

	for await (const event of subscription) {
		if (event.data === null) {
			continue
		}

		store.set((previousState) => {
			const updatedGame = event.data
				?.gamesGamesgamesgamesgamesGameUpdated as GameRecord

			const newCatalog = previousState.gamesCatalog
				? [...previousState.gamesCatalog]
				: []

			const index = newCatalog.findIndex(
				(game) => game.record.uri === updatedGame.uri,
			)

			newCatalog.splice(index, 1)

			return { gamesCatalog: newCatalog }
		})
	}
}
