// Local imports
import { getMe } from '@/helpers/oauth'
import { setProfileTypeCookie } from '@/helpers/setProfileTypeCookie'
import { getUserProfile } from '@/store/actions/getUserProfile'
import { store } from '@/store/store'
import { subscribe } from '@/store/subscribe'

export async function initialize() {
	if (typeof window === 'undefined') {
		return
	}

	const me = await getMe()

	if (me) {
		// Store the DID from HappyView session
		store.set(() => ({ authDid: me.did }))

		await getUserProfile()

		const { profileType } = store.state
		if (profileType) {
			setProfileTypeCookie(profileType)
		}

		subscribe()
	}
}
