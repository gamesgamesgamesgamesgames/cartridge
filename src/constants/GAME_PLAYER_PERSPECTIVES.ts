// Local imports
import { PlayerPerspective } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'
import PlayerPerspectiveLexicon from '@/lexicons/games/gamesgamesgamesgames/playerPerspective.json'

// Types
type PlayerPerspectiveLexiconIDs = keyof typeof PlayerPerspectiveLexicon.defs

export const GAME_PLAYER_PERSPECTIVES = Object.entries(PlayerPerspectiveLexicon.defs).reduce(
	(accumulator, kv) => {
		const [id, { description: name }] = kv as [
			PlayerPerspectiveLexiconIDs,
			{ description: string },
		]

		accumulator[id as PlayerPerspective] = {
			id,
			name,
		}

		return accumulator
	},
	{} as Record<PlayerPerspective, {
		id: PlayerPerspectiveLexiconIDs,
		name: string,
	}>,
)
