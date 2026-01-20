// Module imports
import { type Client } from 'graphql-ws'

// Local imports
import { type GameRecord } from '@/typedefs/GameRecord'
import { store } from '@/store/store'

export async function subscribeToCreates(client: Client) {
	const subscription = client.iterate<{
		gamesGamesgamesgamesgamesGameCreated: GameRecord
	}>({
		query: `
			subscription {
				gamesGamesgamesgamesgamesGameCreated {
					uri
					name
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
				{
					isHydrated: false,
					record: event.data
						?.gamesGamesgamesgamesgamesGameCreated as GameRecord,
				},
			],
		}))
	}
}
