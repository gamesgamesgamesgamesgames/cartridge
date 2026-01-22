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

		const fqid = `games.gamesgamesgamesgames.theme#${id}` as Theme 

		accumulator[fqid] = {
			id,
			fqid,
			name,
		}

		return accumulator
	},
	{} as Record<Theme, {
		id: ThemeLexiconIDs,
		fqid: Theme,
		name: string,
	}>,
)
