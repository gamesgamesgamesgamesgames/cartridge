// Local imports
import { handleCallback, hasRequiredScopes, hasStudioScopes, restoreSession } from '@/helpers/oauth'
import { setAuthCookie } from '@/helpers/setAuthCookie'
import { setProfileTypeCookie } from '@/helpers/setProfileTypeCookie'
import { getUserProfile } from '@/store/actions/getUserProfile'
import { store } from '@/store/store'
import { subscribe } from '@/store/subscribe'

function updateStudioReauth(scopes: string[]) {
	const { user } = store.state
	if (user?.verifiedAccountType && scopes.length > 0 && !hasStudioScopes(scopes)) {
		store.set(() => ({ needsStudioReauth: true }))
	}
}

export async function loginFromCallback() {
	const session = await handleCallback()
	const scopes = session.scopes ?? []

	store.set(() => ({
		authDid: session.did,
		authScopes: scopes,
		needsReauth: !hasRequiredScopes(scopes),
	}))
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

	const scopes = session.scopes ?? []
	store.set(() => ({
		authDid: session.did,
		authScopes: scopes,
		needsReauth: !hasRequiredScopes(scopes),
	}))
	setAuthCookie()
	await getUserProfile()
	updateStudioReauth(scopes)

	const { profileType } = store.state
	if (profileType) {
		setProfileTypeCookie(profileType)
	}

	subscribe()
}
