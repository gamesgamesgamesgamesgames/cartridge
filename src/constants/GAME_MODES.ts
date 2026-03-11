// Local imports
import { Mode } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'
import ModeLexicon from '@/lexicons/games/gamesgamesgamesgames/mode.json'

// Types
type ModeLexiconIDs = keyof typeof ModeLexicon.defs

export const GAME_MODES = Object.entries(ModeLexicon.defs).reduce(
	(accumulator, kv) => {
		const [id, { description: name }] = kv as [
			ModeLexiconIDs,
			{ description: string },
		]

		accumulator[id as Mode] = {
			id,
			name,
		}

		return accumulator
	},
	{} as Record<Mode, {
		id: ModeLexiconIDs,
		name: string,
	}>,
)
