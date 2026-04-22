// Local imports
import { clearAuthCookie } from '@/helpers/clearAuthCookie'
import { clearProfileTypeCookie } from '@/helpers/clearProfileTypeCookie'
import { getClient, getSession, setSession } from '@/helpers/oauth'
import { store } from '@/store/store'
import { INITIAL_STATE } from '@/store/INITIAL_STATE'

export async function logout() {
	const did = store.state.authDid
	const session = getSession()

	if (did && session) {
		try {
			const resp = await session.fetchHandler(
				`/oauth/sessions/${did}`,
				{ method: 'DELETE' },
			)
			if (!resp.ok && resp.status !== 404) {
				console.warn('Failed to delete session on server:', resp.status)
			}
		} catch {
			// Best-effort server-side cleanup
		}
	}

	if (did) {
		localStorage.removeItem(`@happyview/oauth(happyview:session:${did})`)
		localStorage.removeItem('@happyview/oauth(happyview:last-active-did)')
	}

	setSession(null)
	store.set(() => INITIAL_STATE)
	clearAuthCookie()
	clearProfileTypeCookie()
}
