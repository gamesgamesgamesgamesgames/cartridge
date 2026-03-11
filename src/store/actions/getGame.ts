// Local imports
import * as API from '@/helpers/API'
import { type Game } from '@/typedefs/Game'

export async function getGame(query: { uri: string } | { slug: string }): Promise<Game | undefined> {
	const record = await API.getGame(query)

	if (!record) {
		return undefined
	}

	return { isHydrated: true, record }
}
