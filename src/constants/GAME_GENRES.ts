// Local imports
import { Genre } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'

const GENRE_LABELS: Record<string, string> = {
	fighting: 'Fighting',
	music: 'Music',
	platform: 'Platform',
	pointAndClick: 'Point and Click',
	puzzle: 'Puzzle',
	racing: 'Racing',
	rpg: 'RPG',
	rts: 'RTS',
	shooter: 'Shooter',
	simulator: 'Simulator',
}

export const GAME_GENRES = Object.fromEntries(
	Object.entries(GENRE_LABELS).map(([id, name]) => [id, { id, name }]),
) as Record<Genre, { id: string; name: string }>
