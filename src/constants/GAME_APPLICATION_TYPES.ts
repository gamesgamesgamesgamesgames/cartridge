// Local imports
import { type ApplicationType } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'

const APPLICATION_TYPE_LABELS: Record<ApplicationType, string> = {
	addon: 'Add-on',
	bundle: 'Bundle',
	dlc: 'DLC',
	episode: 'Episode',
	expandedGame: 'Expanded Game',
	expansion: 'Expansion',
	fork: 'Fork',
	game: 'Game',
	mod: 'Mod',
	port: 'Port',
	remake: 'Remake',
	remaster: 'Remaster',
	season: 'Season',
	standaloneExpansion: 'Standalone Expansion',
	update: 'Update',
}

export const GAME_APPLICATION_TYPES = Object.entries(APPLICATION_TYPE_LABELS).reduce(
	(accumulator, [id, name]) => {
		accumulator[id as ApplicationType] = { id: id as ApplicationType, name }
		return accumulator
	},
	{} as Record<ApplicationType, {
		id: ApplicationType,
		name: string,
	}>,
)
