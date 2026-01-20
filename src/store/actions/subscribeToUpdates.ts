// Module imports
import { type Client } from 'graphql-ws'

// Local imports
import { type GameRecord } from '@/typedefs/GameRecord'
import { wait } from '@/helpers/wait'
import { store } from '@/store/store'

export async function subscribeToUpdates(client: Client) {
	const subscription = client.iterate<{
		gamesGamesgamesgamesgamesGameUpdated: GameRecord
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

		await wait(1000)

		store.set((previousState) => {
			const updatedGame = {
				isHydrated: false,
				record: event.data?.gamesGamesgamesgamesgamesGameUpdated as GameRecord,
			}

			const newCatalog = previousState.gamesCatalog
				? [...previousState.gamesCatalog]
				: []

			const index = newCatalog.findIndex(
				(game) => game.record.uri === updatedGame.record.uri,
			)

			if (index !== -1) {
				newCatalog[index] = updatedGame
			} else {
				newCatalog.push(updatedGame)
			}

			return { gamesCatalog: newCatalog }
		})
	}
}
