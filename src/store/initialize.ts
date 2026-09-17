// Local imports
import { hasRequiredScopes, restoreSession } from '@/helpers/oauth'
import { toScopeList } from '@/helpers/grantedScopes'
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
		const scopes = toScopeList(session.scopes)
		store.set(() => ({
			authDid: session.did,
			authScopes: scopes,
			needsReauth: !hasRequiredScopes(scopes),
		}))

		await getUserProfile()

		const { profileType } = store.state
		if (profileType) {
			setProfileTypeCookie(profileType)
		}

		subscribe()
	}
}
