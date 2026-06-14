// Module imports
import { HappyViewBrowserClient } from '@happyview/oauth-client-browser'
import type { HappyViewSession } from '@happyview/oauth-client-browser'

// Local imports
import { REQUIRED_SCOPES, STUDIO_SCOPES } from '@/constants/REQUIRED_SCOPES'
import { store } from '@/store/store'

// Constants
const PUBLIC_URL = process.env.NEXT_PUBLIC_URL!
const INSTANCE_URL = process.env.NEXT_PUBLIC_HAPPYVIEW_URL!
const CLIENT_KEY = process.env.NEXT_PUBLIC_HAPPYVIEW_CLIENT_KEY!
const RETURN_URL_KEY = 'pentaract_return_url'
const PENDING_LIKE_KEY = 'pentaract_pending_like'
const PENDING_LIST_ADD_KEY = 'pentaract_pending_list_add'

const BASE_SCOPES = [
	'atproto',
	'include:games.gamesgamesgamesgames.authProfiles',
	'include:games.gamesgamesgamesgames.authGameInteractions',
	'include:games.gamesgamesgamesgames.authContributions',
	'include:games.gamesgamesgamesgames.authCustomFeeds',
	'include:games.gamesgamesgamesgames.authGameBrowsing',
]

const STUDIO_SCOPE_BUNDLES = [
	'include:games.gamesgamesgamesgames.authStudioCatalog',
	'include:games.gamesgamesgamesgames.authStudioOrgs',
]

// Types
export type MeResponse = {
	did: string
	is_admin: boolean
}

// Singleton client
let _client: HappyViewBrowserClient | null = null

export function getClient(): HappyViewBrowserClient {
	if (!_client) {
		const isLoopback = /^(?:localhost|127\.0\.0\.1)/giu.test(PUBLIC_URL)
		const protocol = isLoopback ? 'http' : 'https'
		const allScopes = [...BASE_SCOPES, ...STUDIO_SCOPE_BUNDLES]
		const scopes = allScopes.join(' ')
		const loopbackUrl = PUBLIC_URL.replace(/^localhost/, '127.0.0.1')
		const redirectUri = isLoopback
			? `http://${loopbackUrl}/oauth/callback`
			: undefined
		const clientId = isLoopback
			? `http://localhost?scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(redirectUri!)}`
			: `${protocol}://${PUBLIC_URL}/oauth-client-metadata.json`
		_client = new HappyViewBrowserClient({
			instanceUrl: INSTANCE_URL,
			clientId,
			clientKey: CLIENT_KEY,
			redirectUri,
			fetch: (input, init) => window.fetch(input, init),
			scopes,
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
async function isHandleVerified(handle: string): Promise<boolean> {
	try {
		const params = new URLSearchParams({ handle })
		const response = await fetch(
			`${INSTANCE_URL}/xrpc/games.gamesgamesgamesgames.getProfile?${params}`,
		)
		if (!response.ok) return false
		const data = await response.json()
		return Boolean(data.profile?.verifiedAccountType)
	} catch {
		return false
	}
}

export async function loginWithRedirect(handle?: string, returnUrl?: string) {
	if (window.location.hostname === 'localhost') {
		const url = new URL(window.location.href)
		url.hostname = '127.0.0.1'
		if (!url.searchParams.has('handle') && handle) {
			url.searchParams.set('handle', handle)
		}
		if (!url.searchParams.has('returnTo') && returnUrl) {
			url.searchParams.set('returnTo', returnUrl)
		}
		window.location.href = url.toString()
		return
	}

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

	const verified = await isHandleVerified(handle)
	const scopes = verified
		? [...BASE_SCOPES, ...STUDIO_SCOPE_BUNDLES].join(' ')
		: BASE_SCOPES.join(' ')

	const client = getClient()
	await client.login(handle, { scopes })
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

function normalizeScopes(scopes: string[]): Set<string> {
	const normalized = new Set<string>()
	for (const scope of scopes) {
		if (scope.startsWith('repo?collection=')) {
			const params = new URLSearchParams(scope.slice(4))
			for (const collection of params.getAll('collection')) {
				normalized.add(`repo:${collection}`)
			}
		} else {
			normalized.add(scope)
		}
	}
	return normalized
}

export function hasRequiredScopes(scopes: string[]): boolean {
	const normalized = normalizeScopes(scopes)
	const missing = REQUIRED_SCOPES.filter((scope) => {
		const base = scope.split('?')[0]!
		return !normalized.has(base) && !normalized.has(scope)
	})
	if (missing.length > 0) {
		console.log('[auth] missing scopes:', missing)
	}
	return missing.length === 0
}

export function hasStudioScopes(scopes: string[]): boolean {
	const normalized = normalizeScopes(scopes)
	return STUDIO_SCOPES.every((scope) => {
		const base = scope.split('?')[0]!
		return normalized.has(base) || normalized.has(scope)
	})
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

export function setPendingListAdd(gameUri: string) {
	sessionStorage.setItem(PENDING_LIST_ADD_KEY, gameUri)
}

export function consumePendingListAdd(): string | null {
	const uri = sessionStorage.getItem(PENDING_LIST_ADD_KEY)
	sessionStorage.removeItem(PENDING_LIST_ADD_KEY)
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
