import { type AccountType } from '@/constants/ACCOUNT_TYPES'

export type User = {
	did: string
	handle?: string
	displayName?: string
	description?: string
	avatarURL?: string
	verifiedAccountType?: AccountType
}
