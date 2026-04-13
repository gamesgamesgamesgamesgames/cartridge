// Local imports
import { store } from '@/store/store'

// Constants
const API_URL = process.env.NEXT_PUBLIC_HAPPYVIEW_URL!
const RETURN_URL_KEY = 'pentaract_return_url'
const PENDING_LIKE_KEY = 'pentaract_pending_like'

// Types
export type MeResponse = {
	did: string
	is_admin: boolean
}

// Public API
export async function loginWithRedirect(handle?: string, returnUrl?: string, scope?: string) {
	// Store the page to return to after login
	let destination = returnUrl ?? window.location.pathname + window.location.search
	if (destination.startsWith('/login') || destination.startsWith('/callback')) {
		destination = '/'
	}
	sessionStorage.setItem(RETURN_URL_KEY, destination)

	// Build the callback URL for this frontend
	const callbackUrl = `${window.location.origin}/callback`

	const params = new URLSearchParams()
	params.set('redirect_uri', callbackUrl)

	// Only pass client_id when the origin is publicly reachable. ATProto OAuth
	// requires the PDS to fetch the client_id URL, which fails for localhost.
	const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:|$)/.test(window.location.origin)
	if (!isLocal) {
		params.set('client_id', `${window.location.origin}/oauth-client-metadata.json`)
	}
	if (handle) {
		params.set('handle', handle)
	}
	if (scope) {
		params.set('scope', scope)
	}

	const response = await fetch(`${API_URL}/auth/login?${params}`, {
		credentials: 'include',
	})

	if (!response.ok) {
		throw new Error('Failed to initiate login')
	}

	const data = await response.json()
	window.location.href = data.url
}

export async function getMe(): Promise<MeResponse | null> {
	try {
		const response = await fetch(`${API_URL}/auth/me`, {
			credentials: 'include',
		})

		if (!response.ok) {
			return null
		}

		return response.json()
	} catch {
		return null
	}
}

export function isAuthenticated(): boolean {
	return store.state.authDid !== null
}

export function getReturnUrl(): string | null {
	const url = sessionStorage.getItem(RETURN_URL_KEY)
	sessionStorage.removeItem(RETURN_URL_KEY)
	return url
}

export function setPendingLike(gameUri: string) {
	sessionStorage.setItem(PENDING_LIKE_KEY, gameUri)
}

export function consumePendingLike(): string | null {
	const uri = sessionStorage.getItem(PENDING_LIKE_KEY)
	sessionStorage.removeItem(PENDING_LIKE_KEY)
	return uri
}

export async function logout() {
	await fetch(`${API_URL}/auth/logout`, {
		method: 'POST',
		credentials: 'include',
	}).catch(() => {})

	window.location.href = '/'
}
