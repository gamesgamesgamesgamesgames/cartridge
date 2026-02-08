// Local imports
import { clearAuthCookie } from '@/helpers/clearAuthCookie'
import { setAuthCookie } from '@/helpers/setAuthCookie'
import { getUserProfile } from '@/store/actions/getUserProfile'
import { store } from '@/store/store'
import { subscribe } from '@/store/subscribe'

export async function login() {
	const { quicksliceClient } = store.state

	if (!quicksliceClient) {
		throw new Error('Cannot login before client is initialized.')
	}

	const session = await quicksliceClient.handleRedirectCallback()

	if (session) {
		setAuthCookie()
		await getUserProfile()
		subscribe()
	}
}

export async function syncAuthCookie() {
	const { quicksliceClient } = store.state

	if (!quicksliceClient) {
		throw new Error('Cannot sync auth before client is initialized.')
	}

	const isAuthenticated = await quicksliceClient.isAuthenticated()

	if (isAuthenticated) {
		setAuthCookie()
	} else {
		clearAuthCookie()
	}

	return isAuthenticated
}
