// Module imports
import { HappyViewBrowserClient } from '@happyview/oauth-client-browser'
import type { HappyViewSession } from '@happyview/oauth-client-browser'

// Local imports
import { store } from '@/store/store'

// Constants
const INSTANCE_URL = process.env.NEXT_PUBLIC_HAPPYVIEW_URL!
const CLIENT_KEY = process.env.NEXT_PUBLIC_HAPPYVIEW_CLIENT_KEY!
const RETURN_URL_KEY = 'pentaract_return_url'
const PENDING_LIKE_KEY = 'pentaract_pending_like'

// Types
export type MeResponse = {
	did: string
	is_admin: boolean
}

// Singleton client
let _client: HappyViewBrowserClient | null = null

export function getClient(): HappyViewBrowserClient {
	if (!_client) {
		_client = new HappyViewBrowserClient({
			instanceUrl: INSTANCE_URL,
			clientKey: CLIENT_KEY,
			fetch: (input, init) => window.fetch(input, init),
			scopes: 'atproto include:games.gamesgamesgamesgames.authBasic',
		})
	}
	return _client
}

// Patch session internals that the library dist doesn't handle correctly in bundled environments
function patchSession(session: HappyViewSession) {
	// Fix "Illegal invocation" — detached native fetch
	;(session as any)._fetch = (input: RequestInfo | URL, init?: RequestInit) =>
		window.fetch(input, init)

	// Fix "invalid DPoP proof header" — dpopKey.publicJwk is not a plain JSON object
	// Read the raw JWK from localStorage (stored by registerSession)
	const storageKey = `@happyview/oauth(happyview:session:${session.did})`
	const stored = localStorage.getItem(storageKey)
	if (stored) {
		const { dpopKey: rawJwk } = JSON.parse(stored)
		const { d: _, ...publicJwk } = rawJwk
		Object.defineProperty((session as any).dpopKey, 'publicJwk', {
			value: publicJwk,
			writable: true,
			configurable: true,
		})
	}
}

// Singleton session (restored or from callback)
let _session: HappyViewSession | null = null

export function getSession(): HappyViewSession | null {
	return _session
}

export function setSession(session: HappyViewSession | null) {
	_session = session
}

// Public API
export async function loginWithRedirect(handle?: string, returnUrl?: string) {
	// Store the page to return to after login
	let destination =
		returnUrl ?? window.location.pathname + window.location.search
	if (
		destination.startsWith('/login') ||
		destination.startsWith('/callback') ||
		destination.startsWith('/oauth/callback')
	) {
		destination = '/'
	}
	sessionStorage.setItem(RETURN_URL_KEY, destination)

	if (!handle) {
		throw new Error('Handle is required for login')
	}

	const client = getClient()
	await client.login(handle)
}

export async function handleCallback(): Promise<HappyViewSession> {
	const client = getClient()
	const session = await client.callback()
	patchSession(session)
	setSession(session)
	return session
}

export async function restoreSession(): Promise<HappyViewSession | null> {
	if (_session) {
		return _session
	}

	try {
		const client = getClient()
		const session = await client.restore()
		if (session) {
			patchSession(session)
			setSession(session)
		}
		return session
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
	const did = store.state.authDid
	if (did) {
		const client = getClient()
		await client.logout(did).catch(() => {})
	}
	setSession(null)
	window.location.href = '/'
}
