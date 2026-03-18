// Types
export type OAuthConfig = {
	clientId: string
	redirectUri: string
	aipUrl: string
}

export type OAuthTokens = {
	accessToken: string
	refreshToken?: string
	expiresAt: number
	sub: string
}

// Constants
const STORAGE_KEY = 'pentaract_oauth_tokens'
const VERIFIER_KEY = 'pentaract_pkce_verifier'
const STATE_KEY = 'pentaract_oauth_state'
const RETURN_URL_KEY = 'pentaract_return_url'
const PENDING_LIKE_KEY = 'pentaract_pending_like'

function getConfig(): OAuthConfig {
	return {
		clientId: process.env.NEXT_PUBLIC_AIP_CLIENT_ID!,
		redirectUri: process.env.NEXT_PUBLIC_AIP_REDIRECT_URI!,
		aipUrl: process.env.NEXT_PUBLIC_AIP_URL!,
	}
}

// PKCE helpers using Web Crypto API
function generateRandomString(length: number): string {
	const array = new Uint8Array(length)
	crypto.getRandomValues(array)
	return Array.from(array, (byte) => byte.toString(36).padStart(2, '0'))
		.join('')
		.slice(0, length)
}

async function sha256(plain: string): Promise<ArrayBuffer> {
	const encoder = new TextEncoder()
	return crypto.subtle.digest('SHA-256', encoder.encode(plain))
}

function base64URLEncode(buffer: ArrayBuffer): string {
	const bytes = new Uint8Array(buffer)
	let binary = ''
	for (const byte of bytes) {
		binary += String.fromCharCode(byte)
	}
	return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function generatePKCE() {
	const verifier = generateRandomString(64)
	const challenge = base64URLEncode(await sha256(verifier))
	return { verifier, challenge }
}

async function fetchUserInfo(config: OAuthConfig, accessToken: string): Promise<{ sub: string }> {
	const response = await fetch(`${config.aipUrl}/oauth/userinfo`, {
		headers: { 'Authorization': `Bearer ${accessToken}` },
	})

	if (!response.ok) {
		throw new Error(`Failed to fetch userinfo: ${response.status}`)
	}

	return response.json()
}

// Public API
export async function loginWithRedirect(handle?: string, returnUrl?: string) {
	const config = getConfig()
	const { verifier, challenge } = await generatePKCE()
	const state = generateRandomString(32)

	sessionStorage.setItem(VERIFIER_KEY, verifier)
	sessionStorage.setItem(STATE_KEY, state)

	// Store the page to return to after login
	let destination = returnUrl ?? window.location.pathname + window.location.search
	if (destination.startsWith('/login') || destination.startsWith('/callback')) {
		destination = '/'
	}
	sessionStorage.setItem(RETURN_URL_KEY, destination)

	const params = new URLSearchParams({
		response_type: 'code',
		client_id: config.clientId,
		redirect_uri: config.redirectUri,
		code_challenge: challenge,
		code_challenge_method: 'S256',
		state,
		scope: 'atproto:atproto atproto:transition:generic',
	})

	if (handle) {
		params.set('login_hint', handle)
	}

	window.location.href = `${config.aipUrl}/oauth/authorize?${params.toString()}`
}

export async function handleRedirectCallback(): Promise<OAuthTokens> {
	const config = getConfig()
	const params = new URLSearchParams(window.location.search)
	const code = params.get('code')
	const state = params.get('state')
	const storedState = sessionStorage.getItem(STATE_KEY)
	const verifier = sessionStorage.getItem(VERIFIER_KEY)

	if (!code || !state || !verifier) {
		throw new Error('Missing OAuth callback parameters')
	}

	if (state !== storedState) {
		throw new Error('OAuth state mismatch')
	}

	sessionStorage.removeItem(VERIFIER_KEY)
	sessionStorage.removeItem(STATE_KEY)

	const response = await fetch(`${config.aipUrl}/oauth/token`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			grant_type: 'authorization_code',
			code,
			redirect_uri: config.redirectUri,
			client_id: config.clientId,
			code_verifier: verifier,
		}),
	})

	if (!response.ok) {
		const error = await response.text()
		throw new Error(`Token exchange failed: ${error}`)
	}

	const data = await response.json()
	const userInfo = await fetchUserInfo(config, data.access_token)

	const tokens: OAuthTokens = {
		accessToken: data.access_token,
		refreshToken: data.refresh_token,
		expiresAt: Date.now() + data.expires_in * 1000,
		sub: userInfo.sub,
	}

	localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens))
	return tokens
}

export function isAuthenticated(): boolean {
	const tokens = getStoredTokens()
	if (!tokens) return false
	return tokens.expiresAt > Date.now()
}

export function getStoredTokens(): OAuthTokens | null {
	if (typeof window === 'undefined') return null
	const raw = localStorage.getItem(STORAGE_KEY)
	if (!raw) return null
	try {
		return JSON.parse(raw) as OAuthTokens
	} catch {
		return null
	}
}

export function getAccessToken(): string | null {
	const tokens = getStoredTokens()
	if (!tokens || tokens.expiresAt <= Date.now()) return null
	return tokens.accessToken
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
	const tokens = getStoredTokens()
	if (tokens?.accessToken) {
		const config = getConfig()
		// Best-effort revocation — don't block logout if it fails
		await fetch(`${config.aipUrl}/oauth/revoke`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({
				token: tokens.accessToken,
				client_id: config.clientId,
			}),
		}).catch(() => {})
	}

	localStorage.removeItem(STORAGE_KEY)
	window.location.href = '/login'
}
