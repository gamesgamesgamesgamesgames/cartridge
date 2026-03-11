// Module imports
import { type AtUriString, type BlobRef } from '@atproto/lex'

// Local imports
import { Main as GameLexicon } from '@/helpers/lexicons/games/gamesgamesgamesgames/game.defs'
import { MediaItem } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'

export type GameRecord = Omit<GameLexicon, 'media'> & {
	media?: (Omit<MediaItem, 'blob'> & {
		blob?: BlobRef & { url: string }
	})[]
	name: string
	slug?: string
	uri: AtUriString
}
