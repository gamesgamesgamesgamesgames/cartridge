// Module imports
import { createClient } from 'graphql-ws'
import { subscribeToCreates } from '@/store/actions/subscribeToCreates'
import { subscribeToUpdates } from '@/store/actions/subscribeToUpdates'
import { subscribeToDeletes } from '@/store/actions/subscribeToDeletes'

export async function subscribe() {
	const client = createClient({
		url: `ws://${process.env.NEXT_PUBLIC_QUICKSLICE_SERVER_DOMAIN!}/graphql`,
	})

	Promise.all([
		subscribeToCreates(client),
		subscribeToDeletes(client),
		subscribeToUpdates(client),
	])
}
