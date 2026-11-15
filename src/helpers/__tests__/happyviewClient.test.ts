import { afterEach, describe, expect, test, vi } from 'vitest'

import { happyviewClientHeaders } from '@/helpers/happyviewClient'

afterEach(() => {
	vi.unstubAllEnvs()
	vi.unstubAllGlobals()
})

describe('happyviewClientHeaders', () => {
	test('the server uses its own confidential client when configured', () => {
		vi.stubEnv('NEXT_PUBLIC_HAPPYVIEW_CLIENT_KEY', 'hvc_public')
		vi.stubEnv('HAPPYVIEW_SERVER_CLIENT_KEY', 'hvc_server')
		vi.stubEnv('HAPPYVIEW_SERVER_CLIENT_SECRET', 'shh')
		expect(happyviewClientHeaders()).toEqual({ 'x-client-key': 'hvc_server', 'x-client-secret': 'shh' })
	})

	test('the server falls back to the public key while the server client is not set up', () => {
		vi.stubEnv('NEXT_PUBLIC_HAPPYVIEW_CLIENT_KEY', 'hvc_public')
		vi.stubEnv('HAPPYVIEW_SERVER_CLIENT_KEY', '')
		vi.stubEnv('HAPPYVIEW_SERVER_CLIENT_SECRET', '')
		expect(happyviewClientHeaders()).toEqual({ 'x-client-key': 'hvc_public' })
	})

	test('a key without its secret also falls back', () => {
		vi.stubEnv('NEXT_PUBLIC_HAPPYVIEW_CLIENT_KEY', 'hvc_public')
		vi.stubEnv('HAPPYVIEW_SERVER_CLIENT_KEY', 'hvc_server')
		vi.stubEnv('HAPPYVIEW_SERVER_CLIENT_SECRET', '')
		expect(happyviewClientHeaders()).toEqual({ 'x-client-key': 'hvc_public' })
	})

	test('the browser always sends the public key, never the server secret', () => {
		vi.stubGlobal('window', {})
		vi.stubEnv('NEXT_PUBLIC_HAPPYVIEW_CLIENT_KEY', 'hvc_public')
		vi.stubEnv('HAPPYVIEW_SERVER_CLIENT_KEY', 'hvc_server')
		vi.stubEnv('HAPPYVIEW_SERVER_CLIENT_SECRET', 'shh')
		expect(happyviewClientHeaders()).toEqual({ 'x-client-key': 'hvc_public' })
	})
})

describe('API requests', () => {
	test('an anonymous server request carries the server client credentials', async () => {
		vi.stubEnv('HAPPYVIEW_SERVER_CLIENT_KEY', 'hvc_server')
		vi.stubEnv('HAPPYVIEW_SERVER_CLIENT_SECRET', 'shh')
		vi.doMock('@/helpers/oauth', () => ({ getSession: () => null }))
		const seen: Array<Record<string, string>> = []
		vi.stubGlobal('fetch', vi.fn(async (_url: string, init: RequestInit) => {
			seen.push(init.headers as Record<string, string>)
			return new Response(JSON.stringify({ game: { uri: 'at://g' } }), { status: 200 })
		}))
		const API = await import('@/helpers/API')
		await API.getGame({ slug: 'dark-souls' })
		expect(seen[0]['x-client-key']).toBe('hvc_server')
		expect(seen[0]['x-client-secret']).toBe('shh')
	})
})
