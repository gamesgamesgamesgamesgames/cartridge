// Local imports
import { handleCallback, restoreSession } from '@/helpers/oauth'
import { setAuthCookie } from '@/helpers/setAuthCookie'
import { setProfileTypeCookie } from '@/helpers/setProfileTypeCookie'
import { getUserProfile } from '@/store/actions/getUserProfile'
import { store } from '@/store/store'
import { subscribe } from '@/store/subscribe'

export async function loginFromCallback() {
	const session = await handleCallback()

	store.set(() => ({ authDid: session.did }))
	setAuthCookie()
	await getUserProfile()

	const { profileType } = store.state
	if (profileType) {
		setProfileTypeCookie(profileType)
	}

	subscribe()
}

export async function loginFromStorage() {
	const session = await restoreSession()

	if (!session) {
		throw new Error('Not authenticated')
	}

	store.set(() => ({ authDid: session.did }))
	setAuthCookie()
	await getUserProfile()

	const { profileType } = store.state
	if (profileType) {
		setProfileTypeCookie(profileType)
	}

	subscribe()
}
