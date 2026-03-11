import * as API from '@/helpers/API'
import { type ProfileSource } from '@/typedefs/ProfileSource'

export const PROFILE_SOURCES: ProfileSource[] = [
	{
		name: 'app.bsky.actor.profile',
		fetch: async () => {
			const profile = await API.getBlueskyProfile()
			if (!profile) return null
			return {
				displayName: profile.displayName,
				description: profile.description,
				avatarURL: profile.avatarURL,
				avatarBlob: profile.avatar
					? {
							ref: profile.avatar.$link,
							mimeType: profile.avatar.mimeType,
							size: profile.avatar.size ?? 0,
						}
					: undefined,
			}
		},
	},
]
