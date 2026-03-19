// Local imports
import { getMe } from '@/helpers/oauth'
import { setAuthCookie } from '@/helpers/setAuthCookie'
import { setProfileTypeCookie } from '@/helpers/setProfileTypeCookie'
import { getUserProfile } from '@/store/actions/getUserProfile'
import { store } from '@/store/store'
import { subscribe } from '@/store/subscribe'

export async function login() {
	const me = await getMe()

	if (!me) {
		throw new Error('Not authenticated')
	}

	store.set(() => ({ authDid: me.did }))
	setAuthCookie()
	await getUserProfile()

	const { profileType } = store.state
	if (profileType) {
		setProfileTypeCookie(profileType)
	}

	subscribe()
}
