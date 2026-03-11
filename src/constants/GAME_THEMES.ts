// Local imports
import { Theme } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'
import ThemeLexicon from '@/lexicons/games/gamesgamesgamesgames/theme.json'

// Types
type ThemeLexiconIDs = keyof typeof ThemeLexicon.defs

export const GAME_THEMES = Object.entries(ThemeLexicon.defs).reduce(
	(accumulator, kv) => {
		const [id, { description: name }] = kv as [
			ThemeLexiconIDs,
			{ description: string },
		]

		accumulator[id as Theme] = {
			id,
			name,
		}

		return accumulator
	},
	{} as Record<Theme, {
		id: ThemeLexiconIDs,
		name: string,
	}>,
)
