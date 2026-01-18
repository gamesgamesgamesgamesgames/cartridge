// Module imports
import { type Client } from 'graphql-ws'

// Local imports
import { type Game } from '@/typedefs/Game'
import { store } from '@/store/store'

export async function subscribeToUpdates(client: Client) {
	const subscription = client.iterate<{
		gamesGamesgamesgamesgamesGameUpdated: Game
	}>({
		query: `
			subscription {
				gamesGamesgamesgamesgamesGameUpdated {
					uri
					did
					name
					summary
					type
					modes
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
				?.gamesGamesgamesgamesgamesGameUpdated as Game

			const newCatalog = previousState.gamesCatalog
				? [...previousState.gamesCatalog]
				: []

			const index = newCatalog.findIndex((game) => game.uri === updatedGame.uri)

			newCatalog[index] = updatedGame

			return { gamesCatalog: newCatalog }
		})
	}
}
