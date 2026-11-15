import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { clearGameLookupCache, gameRecordRedirect } from '@/helpers/gameRecordRedirect'

function happyview(answers: Record<string, unknown>) {
	const fetchMock = vi.fn(async (url: URL, _init?: RequestInit) => {
		const key = url.searchParams.get('slug') ? `slug:${url.searchParams.get('slug')}` : `uri:${url.searchParams.get('uri')}`
		if (!(key in answers)) throw new Error(`unexpected ${key}`)
		const a = answers[key]
		if (a === 'down') return new Response('{}', { status: 429 })
		return new Response(JSON.stringify(a), { status: 200 })
	})
	vi.stubGlobal('fetch', fetchMock)
	return fetchMock
}

const req = (path: string) => new NextRequest(new URL(path, 'https://cartridge.dev'))
const CAT = (rkey: string) => `uri:at://did:web:gamesgamesgamesgames.games/games.gamesgamesgamesgames.game/${rkey}`

beforeEach(() => {
	vi.stubEnv('NEXT_PUBLIC_HAPPYVIEW_URL', 'https://hv.test')
	clearGameLookupCache()
})
afterEach(() => {
	vi.unstubAllGlobals()
	vi.unstubAllEnvs()
})

describe('gameRecordRedirect', () => {
	test('a record key for a game with a slug gets a 308 to the slug', async () => {
		happyview({ 'slug:3mghce3msnf2d': {}, [CAT('3mghce3msnf2d')]: { game: { slug: 'dark-souls' } } })
		const res = await gameRecordRedirect(req('/game/3mghce3msnf2d?ref=x'))
		expect(res.status).toBe(308)
		expect(res.headers.get('location')).toBe('https://cartridge.dev/game/dark-souls?ref=x')
	})

	test('a section keeps its place as a fragment', async () => {
		happyview({ 'slug:3moaektlwki2x': {}, [CAT('3moaektlwki2x')]: { game: { slug: 'oot' } } })
		const res = await gameRecordRedirect(req('/game/3moaektlwki2x/reviews'))
		expect(res.headers.get('location')).toBe('https://cartridge.dev/game/oot#reviews')
	})

	test('a game without a slug is left to the page, at its record URL', async () => {
		happyview({ 'slug:3moaektlwki2x': {}, [CAT('3moaektlwki2x')]: { game: {} } })
		const res = await gameRecordRedirect(req('/game/3moaektlwki2x'))
		expect(res.headers.get('location')).toBeNull()
	})

	test('a real slug that looks like a record key wins', async () => {
		const fetchMock = happyview({ 'slug:3moaektlwki2x': { game: { slug: '3moaektlwki2x' } } })
		const res = await gameRecordRedirect(req('/game/3moaektlwki2x'))
		expect(res.headers.get('location')).toBeNull()
		expect(fetchMock).toHaveBeenCalledTimes(1)
	})

	test('ordinary slugs and other paths make no lookup at all', async () => {
		const fetchMock = happyview({})
		for (const path of ['/game/dark-souls', '/game/dark-souls/reviews', '/game/3moaektlwki2x/other', '/game/3moaektlwki2x/reviews/x']) {
			expect((await gameRecordRedirect(req(path))).headers.get('location')).toBeNull()
		}
		expect(fetchMock).not.toHaveBeenCalled()
	})

	test('lookups are cached, including a game without a slug', async () => {
		const fetchMock = happyview({ 'slug:3moaektlwki2x': {}, [CAT('3moaektlwki2x')]: { game: {} } })
		await gameRecordRedirect(req('/game/3moaektlwki2x'))
		await gameRecordRedirect(req('/game/3moaektlwki2x'))
		await gameRecordRedirect(req('/game/3moaektlwki2x/reviews'))
		expect(fetchMock).toHaveBeenCalledTimes(2)
	})

	test('a failure is not cached', async () => {
		const fetchMock = happyview({ 'slug:3moaektlwki2x': 'down' })
		await gameRecordRedirect(req('/game/3moaektlwki2x'))
		await gameRecordRedirect(req('/game/3moaektlwki2x'))
		expect(fetchMock).toHaveBeenCalledTimes(2)
	})

	test('the lookup uses the server client when it is configured', async () => {
		vi.stubEnv('HAPPYVIEW_SERVER_CLIENT_KEY', 'hvc_server')
		vi.stubEnv('HAPPYVIEW_SERVER_CLIENT_SECRET', 'shh')
		const fetchMock = happyview({ 'slug:3moaektlwki2x': { game: { slug: 'x' } } })
		await gameRecordRedirect(req('/game/3moaektlwki2x'))
		const init = fetchMock.mock.calls[0][1] as RequestInit
		expect((init.headers as Record<string, string>)['x-client-key']).toBe('hvc_server')
		expect((init.headers as Record<string, string>)['x-client-secret']).toBe('shh')
	})

	test('a lookup failure leaves it to the page', async () => {
		happyview({ 'slug:3moaektlwki2x': 'down' })
		const res = await gameRecordRedirect(req('/game/3moaektlwki2x'))
		expect(res.headers.get('location')).toBeNull()
	})
})
