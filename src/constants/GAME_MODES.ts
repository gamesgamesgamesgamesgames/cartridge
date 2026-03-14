// Local imports
import { Mode } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'

const MODE_LABELS: Record<string, string> = {
	battleRoyale: 'Battle Royale',
	cooperative: 'Cooperative',
	mmo: 'MMO',
	multiplayer: 'Multiplayer',
	singlePlayer: 'Single Player',
	splitScreen: 'Split Screen',
}

export const GAME_MODES = Object.fromEntries(
	Object.entries(MODE_LABELS).map(([id, name]) => [id, { id, name }]),
) as Record<Mode, { id: string; name: string }>
