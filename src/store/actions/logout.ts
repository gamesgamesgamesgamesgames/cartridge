// Local imports
import { clearAuthCookie } from '@/helpers/clearAuthCookie'
import { clearProfileTypeCookie } from '@/helpers/clearProfileTypeCookie'
import { logout as oauthLogout } from '@/helpers/oauth'

export function logout() {
	clearAuthCookie()
	clearProfileTypeCookie()
	oauthLogout()
}
