import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import * as API from '@/helpers/API'
import { CATALOG_PAGE_SIZE, listGames } from '@/store/actions/listGames'
import { store } from '@/store/store'

vi.mock('@/helpers/API', () => ({
	listGames: vi.fn(async () => ({ games: [], cursor: undefined })),
}))

const listGamesSpy = vi.mocked(API.listGames)

beforeEach(() => {
	listGamesSpy.mockClear()
	store.set({
		gamesCatalog: null,
		gamesCatalogCursor: null,
		gamesCatalogHasNextPage: false,
		user: { did: 'did:plc:owner', handle: 'studio.test', roles: [] },
	} as never)
})

afterEach(() => {
	store.set({ user: null, gamesCatalog: null, gamesCatalogCursor: null } as never)
})

describe('listGames', () => {
	it('scopes the request to the signed-in user', async () => {
		// `listGames` treats `did` as an optional filter with no fallback to the
		// caller — omitting it returns every published game on the network under
		// a heading that claims the user manages them.
		await listGames()

		expect(listGamesSpy).toHaveBeenCalledTimes(1)
		expect(listGamesSpy.mock.calls[0][0]?.did).toBe('did:plc:owner')
	})

	it('requests a full page so client-side filtering covers the catalog', async () => {
		await listGames()

		expect(listGamesSpy.mock.calls[0][0]?.limit).toBe(CATALOG_PAGE_SIZE)
	})

	it('asks for the caller’s own drafts', async () => {
		// Without this the endpoint filters to `publishedAt IS NOT NULL` and an
		// unpublished game is indistinguishable from one that never saved.
		await listGames()

		expect(listGamesSpy.mock.calls[0][0]?.includeUnpublished).toBe(true)
	})

	it('refuses to fetch when there is no signed-in user', async () => {
		store.set({ user: null } as never)

		await expect(listGames()).rejects.toThrow(/signed-in user/)
		expect(listGamesSpy).not.toHaveBeenCalled()
	})

	it('passes the cursor through when paging', async () => {
		store.set({ gamesCatalogCursor: 'page-2' } as never)

		await listGames()

		expect(listGamesSpy.mock.calls[0][0]?.cursor).toBe('page-2')
	})

	it('appends later pages rather than replacing the catalog', async () => {
		listGamesSpy.mockResolvedValueOnce({
			games: [{ uri: 'at://a', name: 'A' }] as never,
			cursor: 'next',
		})
		await listGames()

		listGamesSpy.mockResolvedValueOnce({
			games: [{ uri: 'at://b', name: 'B' }] as never,
			cursor: undefined,
		})
		await listGames()

		expect(store.state.gamesCatalog).toHaveLength(2)
		expect(store.state.gamesCatalogHasNextPage).toBe(false)
	})

	it('propagates failures so the caller can show an error', async () => {
		listGamesSpy.mockRejectedValueOnce(new Error('listGames failed (401)'))

		await expect(listGames()).rejects.toThrow(/401/)
	})
})

describe('listGames — concurrency', () => {
	it('does not duplicate games when two loads race', async () => {
		// Both callers read the same cursor before either writes, fetch the same
		// page, and append. The component has two effects plus two buttons that
		// can each call this, so the race is reachable.
		listGamesSpy.mockResolvedValue({
			games: [
				{ uri: 'at://a', name: 'A' },
				{ uri: 'at://b', name: 'B' },
			] as never,
			cursor: 'next',
		})

		await Promise.all([listGames(), listGames()])

		const uris = (store.state.gamesCatalog ?? []).map((game) => game.record.uri)

		expect(new Set(uris).size).toBe(uris.length)
	})
})
