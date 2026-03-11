// Local imports
import { Genre } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'
import GenreLexicon from '@/lexicons/games/gamesgamesgamesgames/genre.json'

// Types
type GenreLexiconIDs = keyof typeof GenreLexicon.defs

export const GAME_GENRES = Object.entries(GenreLexicon.defs).reduce(
	(accumulator, kv) => {
		const [id, { description: name }] = kv as [
			GenreLexiconIDs,
			{ description: string },
		]

		accumulator[id as Genre] = {
			id,
			name,
		}

		return accumulator
	},
	{} as Record<
		Genre,
		{
			id: GenreLexiconIDs
			name: string
		}
	>,
)
