export type ProfileSourceData = {
	avatarURL?: string
	avatarBlob?: {
		ref: string
		mimeType: string
		size: number
	}
	description?: string
	displayName?: string
	pronouns?: string
}
