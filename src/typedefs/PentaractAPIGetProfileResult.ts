import { type ActorProfileDetailView } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'
import { type OrgProfileDetailView } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'

export type ProfileWithVerification = (ActorProfileDetailView | OrgProfileDetailView) & {
	verifiedAccountType?: 'studio' | 'developer' | 'publisher'
}

export type PentaractAPIGetProfileResult = {
	profile: ProfileWithVerification | null
	profileType: 'actor' | 'org' | null
	handle?: string
}
