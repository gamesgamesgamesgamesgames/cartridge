// Local imports
import { queryAPI } from '@/helpers/API'
import { store } from '@/store/store'

export async function getUserProfile() {
	const { authTokens } = store.state

	if (!authTokens) {
		throw new Error('Cannot get user profile before logging in.')
	}

	const response = await queryAPI('/xrpc/app.bsky.actor.getProfile')

	if (!response.ok) {
		console.warn(`[pentaract] getUserProfile failed: ${response.status}`)
		store.set(() => ({
			user: {
				did: authTokens.sub,
			},
		}))
		return
	}

	const profile = await response.json()

	store.set(() => ({
		user: {
			did: profile.did,
			handle: profile.handle,
			displayName: profile.displayName,
			description: profile.description,
			avatarURL: profile.avatarURL,
		},
	}))
}
