import { afterEach, describe, expect, test, vi } from 'vitest'

vi.mock('@/helpers/oauth', () => ({ getSession: () => null }))

const { getGame, search, GameUnavailableError, SearchUnavailableError } = await import('@/helpers/API')

function answers(...list: Array<{ status: number; body: unknown; headers?: Record<string, string> }>) {
	const fetchMock = vi.fn(async () => {
		const next = list.shift()
		if (!next) throw new Error('no more answers')
		return new Response(JSON.stringify(next.body), { status: next.status, headers: next.headers })
	})
	vi.stubGlobal('fetch', fetchMock)
	return fetchMock
}

afterEach(() => {
	vi.unstubAllGlobals()
})

describe('getGame', () => {
	test('returns the game', async () => {
		answers({ status: 200, body: { game: { uri: 'at://g', name: 'Dark Souls' } } })
		await expect(getGame({ slug: 'dark-souls' })).resolves.toEqual({ uri: 'at://g', name: 'Dark Souls' })
	})

	test('a game that does not exist is undefined, which the page turns into a 404', async () => {
		answers({ status: 200, body: {} })
		await expect(getGame({ slug: 'no-such-game' })).resolves.toBeUndefined()
	})

	test('a server error throws instead of looking like a missing game', async () => {
		answers({ status: 500, body: { error: 'InternalError' } })
		await expect(getGame({ slug: 'dark-souls' })).rejects.toBeInstanceOf(GameUnavailableError)
	})

	test('a short rate limit is retried once, then succeeds', async () => {
		const fetchMock = answers(
			{ status: 429, body: { error: 'RateLimitExceeded' }, headers: { 'retry-after': '0' } },
			{ status: 200, body: { game: { uri: 'at://g', name: 'Dark Souls' } } },
		)
		await expect(getGame({ slug: 'dark-souls' })).resolves.toEqual({ uri: 'at://g', name: 'Dark Souls' })
		expect(fetchMock).toHaveBeenCalledTimes(2)
	})

	test('a rate limit that persists throws, after one retry', async () => {
		const fetchMock = answers(
			{ status: 429, body: {}, headers: { 'retry-after': '0' } },
			{ status: 429, body: {}, headers: { 'retry-after': '0' } },
		)
		await expect(getGame({ slug: 'dark-souls' })).rejects.toBeInstanceOf(GameUnavailableError)
		expect(fetchMock).toHaveBeenCalledTimes(2)
	})

	test('a long Retry-After is not waited out', async () => {
		const fetchMock = answers({ status: 429, body: {}, headers: { 'retry-after': '30' } })
		await expect(getGame({ slug: 'dark-souls' })).rejects.toBeInstanceOf(GameUnavailableError)
		expect(fetchMock).toHaveBeenCalledTimes(1)
	})
})

describe('search under a rate limit', () => {
	test('a short rate limit is retried once', async () => {
		answers(
			{ status: 429, body: {}, headers: { 'retry-after': '0' } },
			{ status: 200, body: { results: [], totalResults: 0 } },
		)
		await expect(search('legend')).resolves.toEqual({ results: [], totalResults: 0 })
	})

	test('a rate limit that persists throws, so the page shows an error', async () => {
		answers({ status: 429, body: {}, headers: { 'retry-after': '0' } }, { status: 429, body: {}, headers: { 'retry-after': '0' } })
		await expect(search('legend')).rejects.toBeInstanceOf(SearchUnavailableError)
	})
})
