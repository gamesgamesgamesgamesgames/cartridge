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

		const fqid = `games.gamesgamesgamesgames.genre#${id}` as Genre 

		accumulator[fqid] = {
			id,
			fqid,
			name,
		}

		return accumulator
	},
	{} as Record<Genre, {
		id: GenreLexiconIDs,
		fqid: Genre,
		name: string,
	}>,
)

console.log(GAME_GENRES)