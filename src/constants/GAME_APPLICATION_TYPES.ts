// Local imports
import { ApplicationType } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'
import ApplicationTypeLexicon from '@/lexicons/games/gamesgamesgamesgames/applicationType.json'

// Types
type ApplicationTypeLexiconIDs = keyof typeof ApplicationTypeLexicon.defs

export const GAME_APPLICATION_TYPES = Object.entries(ApplicationTypeLexicon.defs).reduce(
	(accumulator, kv) => {
		const [id, { description: name }] = kv as [
			ApplicationTypeLexiconIDs,
			{ description: string },
		]

		const fqid = `games.gamesgamesgamesgames.applicationType#${id}` as ApplicationType
		
		accumulator[fqid] = {
			id,
			fqid,
			name,
		}

		return accumulator
	},
	{} as Record<ApplicationType, {
		id: ApplicationTypeLexiconIDs,
		fqid: ApplicationType,
		name: string,
	}>,
)
