import { beforeEach, describe, expect, test, vi } from 'vitest'

const getGame = vi.fn()
vi.mock('@/helpers/API', () => ({ getGame: (...args: unknown[]) => getGame(...args) }))
// React's cache() only memoizes inside a server request; outside one it calls through.
const { loadGameForRoute } = await import('@/helpers/loadGameForRoute')
const { CATALOGUE_DID } = await import('@/helpers/gameRoute')

const G = 'games.gamesgamesgamesgames.game'

beforeEach(() => getGame.mockReset())

describe('loadGameForRoute', () => {
	test('a slug finds the game directly', async () => {
		getGame.mockResolvedValueOnce({ uri: 'at://x', slug: 'dark-souls' })
		await expect(loadGameForRoute('dark-souls')).resolves.toEqual({ game: { uri: 'at://x', slug: 'dark-souls' }, viaRecord: false })
		expect(getGame).toHaveBeenCalledTimes(1)
	})

	test('a record key falls back to the catalogue game by URI', async () => {
		getGame.mockResolvedValueOnce(undefined).mockResolvedValueOnce({ uri: 'at://y', slug: 'elden-ring' })
		await expect(loadGameForRoute('3moaektlwki2x')).resolves.toEqual({ game: { uri: 'at://y', slug: 'elden-ring' }, viaRecord: true })
		expect(getGame.mock.calls[1][0]).toMatchObject({ uri: `at://${CATALOGUE_DID}/${G}/3moaektlwki2x` })
	})

	test('a slug that is not a record key and finds nothing is not found', async () => {
		getGame.mockResolvedValueOnce(undefined)
		await expect(loadGameForRoute('no-such-game')).resolves.toEqual({ game: undefined, viaRecord: false })
		expect(getGame).toHaveBeenCalledTimes(1)
	})

	test('a record key that finds nothing is not found either', async () => {
		getGame.mockResolvedValueOnce(undefined).mockResolvedValueOnce(undefined)
		await expect(loadGameForRoute('3moaektlwki2x')).resolves.toEqual({ game: undefined, viaRecord: false })
	})

	test('a load failure propagates, so the page shows an error instead of a 404', async () => {
		getGame.mockRejectedValueOnce(new Error('getGame answered 429'))
		await expect(loadGameForRoute('dark-souls')).rejects.toThrow('429')
	})
})
