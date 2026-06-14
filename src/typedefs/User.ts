export type User = {
	did: string
	handle?: string
	displayName?: string
	description?: string
	avatarURL?: string
	verifiedAccountType?: 'studio' | 'developer' | 'publisher'
}
