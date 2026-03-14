// Local imports
import { PlayerPerspective } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'

const PERSPECTIVE_LABELS: Record<string, string> = {
	auditory: 'Auditory',
	firstPerson: 'First Person',
	isometric: 'Isometric',
	sideView: 'Side View',
	text: 'Text',
	thirdPerson: 'Third Person',
	topDown: 'Top Down',
	vr: 'VR',
}

export const GAME_PLAYER_PERSPECTIVES = Object.fromEntries(
	Object.entries(PERSPECTIVE_LABELS).map(([id, name]) => [id, { id, name }]),
) as Record<PlayerPerspective, { id: string; name: string }>
