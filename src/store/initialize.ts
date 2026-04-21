// Local imports
import { restoreSession } from '@/helpers/oauth'
import { setProfileTypeCookie } from '@/helpers/setProfileTypeCookie'
import { getUserProfile } from '@/store/actions/getUserProfile'
import { store } from '@/store/store'
import { subscribe } from '@/store/subscribe'

export async function initialize() {
	if (typeof window === 'undefined') {
		return
	}

	const session = await restoreSession()

	if (session) {
		store.set(() => ({ authDid: session.did }))

		await getUserProfile()

		const { profileType } = store.state
		if (profileType) {
			setProfileTypeCookie(profileType)
		}

		subscribe()
	}
}
