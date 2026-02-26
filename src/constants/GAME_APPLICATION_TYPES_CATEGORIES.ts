// Local imports
import { type ApplicationType } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'

export const GAME_APPLICATION_TYPES_CATEGORIES: {
	label: string
	items: ApplicationType[]
}[] = [
	{
		label: 'Core',
		items: [
			'game',
			'port',
			'remake',
			'remaster',
			'expandedGame',
			'standaloneExpansion',
		],
	},
	{
		label: 'Expansion',
		items: [
			'dlc',
			'addon',
			'expansion',
		],
	},
	{
		label: 'Episodic',
		items: [
			'bundle',
			'season',
			'update',
			'episode',
		],
	},
	{
		label: 'Third Party',
		items: [
			'mod',
			'fork',
		],
	},
]
