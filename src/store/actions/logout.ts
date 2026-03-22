// Local imports
import { clearAuthCookie } from '@/helpers/clearAuthCookie'
import { clearProfileTypeCookie } from '@/helpers/clearProfileTypeCookie'
import { logout as oauthLogout } from '@/helpers/oauth'
import { store } from '@/store/store'
import { INITIAL_STATE } from '@/store/INITIAL_STATE'

export async function logout() {
	store.set(() => INITIAL_STATE)
	clearAuthCookie()
	clearProfileTypeCookie()
	await oauthLogout()
}
