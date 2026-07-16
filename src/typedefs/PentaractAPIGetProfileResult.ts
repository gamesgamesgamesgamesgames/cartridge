import { type ActorProfileDetailView } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'
import { type OrgProfileDetailView } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'
import { type AccountType } from '@/constants/ACCOUNT_TYPES'

export type ProfileWithVerification = (ActorProfileDetailView | OrgProfileDetailView) & {
	verifiedAccountType?: AccountType
}

export type PentaractAPIGetProfileResult = {
	profile: ProfileWithVerification | null
	profileType: 'actor' | 'org' | null
	handle?: string
}
