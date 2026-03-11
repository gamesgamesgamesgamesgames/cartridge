import { type CollectionSummaryView } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'
import { type EngineSummaryView } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'
import { type GameSummaryView } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'
import { type PlatformSummaryView } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'
import { type ProfileSummaryView } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'

export type SearchResultItem =
	| (GameSummaryView & { $type: 'games.gamesgamesgamesgames.defs#gameSummaryView' })
	| (ProfileSummaryView & { $type: 'games.gamesgamesgamesgames.defs#profileSummaryView' })
	| (PlatformSummaryView & { $type: 'games.gamesgamesgamesgames.defs#platformSummaryView' })
	| (CollectionSummaryView & { $type: 'games.gamesgamesgamesgames.defs#collectionSummaryView' })
	| (EngineSummaryView & { $type: 'games.gamesgamesgamesgames.defs#engineSummaryView' })

export type PentaractAPISearchResult = {
	cursor?: string
	results: SearchResultItem[]
}
