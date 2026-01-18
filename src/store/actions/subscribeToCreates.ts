// Module imports
import { type Client } from 'graphql-ws'

// Local imports
import { type Game } from '@/typedefs/Game'
import { store } from '@/store/store'

export async function subscribeToCreates(client: Client) {
	const subscription = client.iterate<{
		gamesGamesgamesgamesgamesGameCreated: Game
	}>({
		query: `
			subscription {
				gamesGamesgamesgamesgamesGameCreated {
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

		store.set((previousState) => ({
			gamesCatalog: [
				...(previousState.gamesCatalog || []),
				event.data?.gamesGamesgamesgamesgamesGameCreated as Game,
			],
		}))
	}
}
