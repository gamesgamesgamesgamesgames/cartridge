import { type ActorProfileDetailView } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'
import { type OrgProfileDetailView } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'

export type PentaractAPIGetProfileResult = {
	profile: ActorProfileDetailView | OrgProfileDetailView | null
	profileType: 'actor' | 'org' | null
	handle?: string
}
