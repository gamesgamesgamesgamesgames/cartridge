import { describe, expect, it } from 'vitest'

import {
	APPVIEW_FRAGMENT,
	appviewAud,
	BASE_PERMISSION_SETS,
	baseScopes,
	includeScopes,
	STUDIO_PERMISSION_SETS,
	studioScopes,
} from '@/helpers/oauthScopes'

const INSTANCE = 'https://gamesgamesgamesgames.games'

describe('appviewAud', () => {
	it('builds a did:web service reference from the instance host', () => {
		expect(appviewAud(INSTANCE)).toBe(
			`did:web:gamesgamesgamesgames.games%23${APPVIEW_FRAGMENT}`,
		)
	})

	it('percent-encodes the fragment separator', () => {
		// The scope grammar requires `#` as %23; a literal `#` would truncate the
		// scope at the fragment when the string is parsed as a URL component.
		expect(appviewAud(INSTANCE)).not.toContain('#')
		expect(appviewAud(INSTANCE)).toContain('%23')
	})

	it('encodes a port so a local instance stays a valid did:web', () => {
		expect(appviewAud('http://localhost:3001')).toBe(
			`did:web:localhost%3A3001%23${APPVIEW_FRAGMENT}`,
		)
	})

	it('follows the instance rather than hard-coding production', () => {
		expect(appviewAud('https://staging.example.com')).toContain(
			'did:web:staging.example.com',
		)
	})

	it('ignores path and query on the instance URL', () => {
		expect(appviewAud('https://example.com/some/path?x=1')).toBe(
			`did:web:example.com%23${APPVIEW_FRAGMENT}`,
		)
	})
})

describe('includeScopes', () => {
	it('gives every permission set an audience', () => {
		// Every set we request declares `inheritAud: true`. Per the permission
		// spec, an `include:` with no `aud` makes those rpc permissions invalid,
		// so the set expands to nothing and login is refused.
		for (const scope of includeScopes(BASE_PERMISSION_SETS, INSTANCE)) {
			expect(scope).toMatch(/^include:[a-z0-9.]+\?aud=did:web:/i)
		}
	})

	it('addresses one audience for all of them', () => {
		const auds = includeScopes(
			[...BASE_PERMISSION_SETS, ...STUDIO_PERMISSION_SETS],
			INSTANCE,
		).map((scope) => scope.split('?aud=')[1])

		expect(new Set(auds).size).toBe(1)
	})

	it('matches the shape in the permission spec', () => {
		// Spec example: include:com.example.authBasicFeatures?aud=did:web:api.example.com%23svc_appview
		expect(includeScopes(['com.example.authBasic'], INSTANCE)[0]).toBe(
			`include:com.example.authBasic?aud=did:web:gamesgamesgamesgames.games%23${APPVIEW_FRAGMENT}`,
		)
	})
})

describe('baseScopes', () => {
	it('requests the atproto scope, which the token must carry', () => {
		expect(baseScopes(INSTANCE)).toContain('atproto')
	})

	it('covers every base permission set', () => {
		expect(baseScopes(INSTANCE)).toHaveLength(BASE_PERMISSION_SETS.length + 1)
	})

	it('leaves no bare include: scope', () => {
		const bare = baseScopes(INSTANCE).filter(
			(scope) => scope.startsWith('include:') && !scope.includes('?aud='),
		)

		expect(bare).toEqual([])
	})
})

describe('studioScopes', () => {
	it('keeps blob access, which is not a permission set', () => {
		expect(studioScopes(INSTANCE)).toContain('blob:*/*')
	})

	it('leaves no bare include: scope', () => {
		const bare = studioScopes(INSTANCE).filter(
			(scope) => scope.startsWith('include:') && !scope.includes('?aud='),
		)

		expect(bare).toEqual([])
	})

	it('does not duplicate the base sets', () => {
		const base = new Set(BASE_PERMISSION_SETS as readonly string[])

		for (const nsid of STUDIO_PERMISSION_SETS) {
			expect(base.has(nsid)).toBe(false)
		}
	})
})

describe('loopback client_id round trip', () => {
	it('survives being encoded into, and parsed back out of, the client_id', () => {
		// The scope string already contains %23, and the whole string is then
		// encoded as a query parameter — so the client_id carries %2523. Getting
		// this wrong yields an audience the authorization server cannot parse.
		const scopes = baseScopes(INSTANCE).join(' ')
		const clientId = `http://localhost?scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent('http://127.0.0.1:3000/oauth/callback')}`

		expect(clientId).toContain('%2523')
		expect(new URL(clientId).searchParams.get('scope')).toBe(scopes)
	})

	it('decodes to a DID with a real fragment', () => {
		const scopes = baseScopes(INSTANCE).join(' ')
		const parsed = new URL(
			`http://localhost?scope=${encodeURIComponent(scopes)}`,
		).searchParams.get('scope')!

		const include = parsed.split(' ').find((s) => s.startsWith('include:'))!
		const aud = new URLSearchParams(
			include.slice(include.indexOf('?') + 1),
		).get('aud')

		expect(aud).toBe(`did:web:gamesgamesgamesgames.games#${APPVIEW_FRAGMENT}`)
	})
})
