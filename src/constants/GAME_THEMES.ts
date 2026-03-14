// Local imports
import { Theme } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'

const THEME_LABELS: Record<string, string> = {
	'4x': '4X',
	action: 'Action',
	business: 'Business',
	comedy: 'Comedy',
	drama: 'Drama',
	educational: 'Educational',
	erotic: 'Erotic',
	fantasy: 'Fantasy',
	historical: 'Historical',
	horror: 'Horror',
	kids: 'Kids',
	mystery: 'Mystery',
	nonfiction: 'Non-Fiction',
	openWorld: 'Open World',
	party: 'Party',
	romance: 'Romance',
	sandbox: 'Sandbox',
	scifi: 'Sci-Fi',
	stealth: 'Stealth',
	survival: 'Survival',
	thriller: 'Thriller',
	warfare: 'Warfare',
}

export const GAME_THEMES = Object.fromEntries(
	Object.entries(THEME_LABELS).map(([id, name]) => [id, { id, name }]),
) as Record<Theme, { id: string; name: string }>
