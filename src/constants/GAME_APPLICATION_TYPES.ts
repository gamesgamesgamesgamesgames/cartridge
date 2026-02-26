// Local imports
import { type ApplicationType } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'
import ApplicationTypeLexicon from '@/lexicons/games/gamesgamesgamesgames/applicationType.json'

export const GAME_APPLICATION_TYPES = Object.entries(ApplicationTypeLexicon.defs).reduce(
	(accumulator, kv) => {
		const [id, { description: name }] = kv as [
			ApplicationType,
			{ description: string },
		]

		accumulator[id] = { id, name }

		return accumulator
	},
	{} as Record<ApplicationType, {
		id: ApplicationType,
		name: string,
	}>,
)
