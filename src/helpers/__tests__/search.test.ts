import { afterEach, describe, expect, test, vi } from 'vitest'

vi.mock('@/helpers/oauth', () => ({ getSession: () => null }))

const { search, SearchUnavailableError } = await import('@/helpers/API')

function answer(status: number, body: unknown) {
	vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(body), { status })))
}

afterEach(() => {
	vi.unstubAllGlobals()
})

describe('search', () => {
	test('returns the results of a good answer', async () => {
		answer(200, { results: [{ $type: 'x' }], totalResults: 1 })
		await expect(search('legend')).resolves.toEqual({ results: [{ $type: 'x' }], totalResults: 1 })
	})

	test('an empty result is still a result', async () => {
		answer(200, { results: [], totalResults: 0 })
		await expect(search('qwxz')).resolves.toEqual({ results: [], totalResults: 0 })
	})

	test('an error answer throws instead of looking like no results', async () => {
		answer(502, { error: 'InternalError' })
		await expect(search('legend')).rejects.toBeInstanceOf(SearchUnavailableError)
	})

	test('a 200 without results (an error object) throws too', async () => {
		answer(200, { error: 'MeilisearchError', message: 'timeout' })
		await expect(search('legend')).rejects.toBeInstanceOf(SearchUnavailableError)
	})
})
