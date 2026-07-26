// @vitest-environment happy-dom

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { readClickSource, stashClickSource } from '@/helpers/analytics/attribution'

beforeEach(() => {
	sessionStorage.clear()
	vi.useRealTimers()
})

describe('click attribution', () => {
	it('round-trips a stashed source', () => {
		stashClickSource('celeste', { surface: 'feed', feedName: 'hot', position: 2 })
		expect(readClickSource('celeste')).toEqual({
			surface: 'feed',
			feedName: 'hot',
			position: 2,
		})
	})

	it('consumes the stash so it is only read once', () => {
		stashClickSource('celeste', { surface: 'search', query: 'platformer' })
		expect(readClickSource('celeste')).not.toBeNull()
		expect(readClickSource('celeste')).toBeNull()
	})

	it('returns null for an unknown slug', () => {
		expect(readClickSource('nope')).toBeNull()
	})

	it('ignores a stale stash', () => {
		vi.useFakeTimers()
		vi.setSystemTime(new Date('2026-07-20T00:00:00Z'))
		stashClickSource('celeste', { surface: 'feed', feedName: 'hot' })
		vi.setSystemTime(new Date('2026-07-20T00:20:00Z')) // 20 min later > 10 min window
		expect(readClickSource('celeste')).toBeNull()
	})
})
