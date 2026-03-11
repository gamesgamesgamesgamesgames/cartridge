export type PentaractAPIGetBlueskyProfileResult = {
	did: string
	handle: string
	displayName?: string
	description?: string
	avatarURL?: string
	avatar?: {
		$link: string
		mimeType: string
		size?: number
	}
}
