import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { baseScopes, studioScopes } from '@/helpers/oauthScopes'
import { GET } from '@/app/oauth-client-metadata.json/route'

const PUBLIC_URL = 'cartridge.dev'
const INSTANCE_URL = 'https://gamesgamesgamesgames.games'

async function metadata() {
	return (await GET().json()) as Record<string, string>
}

beforeEach(() => {
	vi.stubEnv('NEXT_PUBLIC_URL', PUBLIC_URL)
	vi.stubEnv('NEXT_PUBLIC_HAPPYVIEW_URL', INSTANCE_URL)
})

afterEach(() => {
	vi.unstubAllEnvs()
})

describe('oauth client metadata', () => {
	it('registers exactly the scopes the client requests', async () => {
		// The authorization server compares each requested scope against this
		// list verbatim. Any drift fails PAR with
		// `invalid_scope: Scope '<scope>' not registered for this client`.
		const registered = (await metadata()).scope.split(' ')
		const requested = [
			...baseScopes(INSTANCE_URL),
			...studioScopes(INSTANCE_URL),
		]

		expect(new Set(registered)).toEqual(new Set(requested))
	})

	it('carries a percent-encoded audience on every permission set', async () => {
		const includes = (await metadata()).scope
			.split(' ')
			.filter((scope) => scope.startsWith('include:'))

		expect(includes.length).toBeGreaterThan(0)

		for (const scope of includes) {
			expect(scope).toContain('?aud=did:web:')
			// A literal '#' here is a different string to the '%23' the client
			// sends, and the comparison is exact.
			expect(scope).toContain('%23')
			expect(scope).not.toContain('#')
		}
	})

	it('registers the studio scopes, which only verified accounts request', async () => {
		// Registration has to cover the widest request any user can make, not
		// the base tier.
		const registered = new Set((await metadata()).scope.split(' '))

		for (const scope of studioScopes(INSTANCE_URL)) {
			expect(registered.has(scope)).toBe(true)
		}
	})

	it('points client_id, client_uri and redirect_uri at the public origin', async () => {
		const doc = await metadata()

		expect(doc.client_id).toBe(`https://${PUBLIC_URL}/oauth-client-metadata.json`)
		expect(doc.client_uri).toBe(`https://${PUBLIC_URL}`)
		expect(doc.redirect_uris).toEqual([`https://${PUBLIC_URL}/oauth/callback`])
	})

	it('uses http for a loopback origin', async () => {
		vi.stubEnv('NEXT_PUBLIC_URL', 'localhost:3000')

		expect((await metadata()).client_id).toBe(
			'http://localhost:3000/oauth-client-metadata.json',
		)
	})

	it('follows the instance when building audiences', async () => {
		vi.stubEnv('NEXT_PUBLIC_HAPPYVIEW_URL', 'https://staging.example.com')

		expect((await metadata()).scope).toContain('did:web:staging.example.com%23')
	})
})
