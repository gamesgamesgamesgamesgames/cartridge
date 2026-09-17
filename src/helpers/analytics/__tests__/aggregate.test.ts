import { describe, expect, it } from 'vitest'

import {
	aggregateCatalog,
	catalogPageviewSeries,
	EMPTY_CATALOG_TOTALS,
	formatDelta,
	periodDelta,
} from '@/helpers/analytics/aggregate'
import { type GameAnalyticsSummary } from '@/helpers/analytics/types'

function series(...values: number[]) {
	return values.map((value, index) => ({
		// Day 01..N of a fixed month; ISO dates sort lexicographically.
		date: `2026-07-${String(index + 1).padStart(2, '0')}`,
		value,
	}))
}

function game(
	overrides: Partial<GameAnalyticsSummary> = {},
): GameAnalyticsSummary {
	return {
		slug: 'a-game',
		name: 'A Game',
		impressions: 1000,
		pageviews: 100,
		ctr: 0.1,
		avgDwellMs: 60000,
		sparkline: series(1, 2, 3, 4),
		...overrides,
	}
}

describe('aggregateCatalog', () => {
	it('returns zeroed totals for an empty catalog', () => {
		expect(aggregateCatalog([])).toEqual(EMPTY_CATALOG_TOTALS)
	})

	it('returns zeroed totals for null or undefined input', () => {
		expect(aggregateCatalog(null)).toEqual(EMPTY_CATALOG_TOTALS)
		expect(aggregateCatalog(undefined)).toEqual(EMPTY_CATALOG_TOTALS)
	})

	it('never produces NaN when every game has zero traffic', () => {
		const totals = aggregateCatalog([
			game({ impressions: 0, pageviews: 0, ctr: 0, avgDwellMs: 0 }),
		])

		expect(totals.ctr).toBe(0)
		expect(totals.avgDwellMs).toBe(0)
		expect(Number.isNaN(totals.ctr)).toBe(false)
		expect(Number.isNaN(totals.avgDwellMs)).toBe(false)
	})

	it('passes a single game through unchanged', () => {
		const only = game({ impressions: 2500, pageviews: 310, ctr: 0.124, avgDwellMs: 91000 })
		const totals = aggregateCatalog([only])

		expect(totals.games).toBe(1)
		expect(totals.impressions).toBe(2500)
		expect(totals.pageviews).toBe(310)
		expect(totals.ctr).toBeCloseTo(0.124, 10)
		expect(totals.avgDwellMs).toBeCloseTo(91000, 10)
	})

	it('sums impressions and pageviews across games', () => {
		const totals = aggregateCatalog([
			game({ impressions: 1000, pageviews: 100 }),
			game({ impressions: 3000, pageviews: 250 }),
		])

		expect(totals.games).toBe(2)
		expect(totals.impressions).toBe(4000)
		expect(totals.pageviews).toBe(350)
	})

	it('weights CTR by impressions, matching total clicks over total impressions', () => {
		// 1000 × 0.10 = 100 clicks, 3000 × 0.20 = 600 clicks.
		// (100 + 600) / 4000 = 0.175 — not the naive mean of 0.15.
		const totals = aggregateCatalog([
			game({ impressions: 1000, ctr: 0.1 }),
			game({ impressions: 3000, ctr: 0.2 }),
		])

		expect(totals.ctr).toBeCloseTo(0.175, 10)
		expect(totals.ctr).not.toBeCloseTo(0.15, 3)
	})

	it('weights dwell by pageviews rather than averaging game means', () => {
		// (100 × 30000 + 900 × 60000) / 1000 = 57000ms, not the naive 45000.
		const totals = aggregateCatalog([
			game({ pageviews: 100, avgDwellMs: 30000 }),
			game({ pageviews: 900, avgDwellMs: 60000 }),
		])

		expect(totals.avgDwellMs).toBeCloseTo(57000, 10)
	})

	it('ignores a zero-impression game when weighting CTR', () => {
		const totals = aggregateCatalog([
			game({ impressions: 1000, ctr: 0.2 }),
			game({ impressions: 0, ctr: 0.9 }),
		])

		expect(totals.ctr).toBeCloseTo(0.2, 10)
	})

	it('treats missing or non-finite metrics as zero', () => {
		const totals = aggregateCatalog([
			game({ impressions: 1000, pageviews: 100, ctr: 0.2, avgDwellMs: 60000 }),
			game({
				impressions: Number.NaN as unknown as number,
				pageviews: undefined as unknown as number,
				ctr: Number.POSITIVE_INFINITY as unknown as number,
				avgDwellMs: null as unknown as number,
			}),
		])

		expect(totals.impressions).toBe(1000)
		expect(totals.pageviews).toBe(100)
		expect(totals.ctr).toBeCloseTo(0.2, 10)
		expect(totals.avgDwellMs).toBeCloseTo(60000, 10)
	})
})

describe('catalogPageviewSeries', () => {
	it('returns an empty series for an empty catalog', () => {
		expect(catalogPageviewSeries([])).toEqual([])
		expect(catalogPageviewSeries(null)).toEqual([])
	})

	it('sums matching dates across games', () => {
		const combined = catalogPageviewSeries([
			game({ sparkline: series(1, 2, 3) }),
			game({ sparkline: series(10, 20, 30) }),
		])

		expect(combined).toEqual([
			{ date: '2026-07-01', value: 11 },
			{ date: '2026-07-02', value: 22 },
			{ date: '2026-07-03', value: 33 },
		])
	})

	it('unions dates when games cover different days', () => {
		const combined = catalogPageviewSeries([
			game({ sparkline: [{ date: '2026-07-01', value: 5 }] }),
			game({ sparkline: [{ date: '2026-07-03', value: 7 }] }),
		])

		expect(combined).toEqual([
			{ date: '2026-07-01', value: 5 },
			{ date: '2026-07-03', value: 7 },
		])
	})

	it('sorts the result ascending regardless of input order', () => {
		const combined = catalogPageviewSeries([
			game({
				sparkline: [
					{ date: '2026-07-09', value: 1 },
					{ date: '2026-07-02', value: 2 },
				],
			}),
		])

		expect(combined.map((point) => point.date)).toEqual([
			'2026-07-02',
			'2026-07-09',
		])
	})

	it('skips games with a missing sparkline', () => {
		const combined = catalogPageviewSeries([
			game({ sparkline: undefined as unknown as [] }),
			game({ sparkline: series(4, 4) }),
		])

		expect(combined).toHaveLength(2)
		expect(combined[0].value).toBe(4)
	})
})

describe('periodDelta', () => {
	it('returns null below the minimum point count', () => {
		expect(periodDelta(series(1, 2, 3))).toBeNull()
		expect(periodDelta(series(1))).toBeNull()
		expect(periodDelta([])).toBeNull()
		expect(periodDelta(null)).toBeNull()
	})

	it('compares the later half against the earlier half', () => {
		// Earlier 10 + 10 = 20, later 12 + 12 = 24 → +20%.
		const delta = periodDelta(series(10, 10, 12, 12))

		expect(delta).toMatchObject({ direction: 'up', percent: 20, previous: 20, current: 24 })
	})

	it('reports a decrease', () => {
		// Earlier 50, later 25 → -50%.
		const delta = periodDelta(series(25, 25, 15, 10))

		expect(delta?.direction).toBe('down')
		expect(delta?.percent).toBe(-50)
	})

	it('drops the oldest point so both halves span equal time', () => {
		// 5 points: the leading 100 is discarded, leaving 10+10 vs 20+20 → +100%.
		const delta = periodDelta(series(100, 10, 10, 20, 20))

		expect(delta?.previous).toBe(20)
		expect(delta?.current).toBe(40)
		expect(delta?.percent).toBe(100)
	})

	it('reads sub-percent drift as flat rather than a trend', () => {
		const delta = periodDelta(series(500, 500, 502, 500))

		expect(delta?.direction).toBe('flat')
		expect(delta?.percent).toBe(0)
	})

	it('normalises a negative rounding result to positive zero', () => {
		const delta = periodDelta(series(500, 500, 499, 500))

		expect(delta?.percent).toBe(0)
		expect(Object.is(delta?.percent, -0)).toBe(false)
	})

	it('returns a null percent instead of Infinity when the baseline is zero', () => {
		const delta = periodDelta(series(0, 0, 40, 60))

		expect(delta?.direction).toBe('up')
		expect(delta?.percent).toBeNull()
		expect(delta?.current).toBe(100)
	})

	it('returns null when nothing happened in either half', () => {
		expect(periodDelta(series(0, 0, 0, 0))).toBeNull()
	})

	it('reports -100% when traffic stops entirely', () => {
		const delta = periodDelta(series(30, 30, 0, 0))

		expect(delta?.direction).toBe('down')
		expect(delta?.percent).toBe(-100)
	})
})

describe('formatDelta', () => {
	it('returns null for a missing delta', () => {
		expect(formatDelta(null)).toBeNull()
	})

	it('signs an increase and leaves a decrease with its own sign', () => {
		expect(formatDelta({ direction: 'up', percent: 18, previous: 1, current: 1 })).toBe('+18%')
		expect(formatDelta({ direction: 'down', percent: -4, previous: 1, current: 1 })).toBe('-4%')
	})

	it('renders a flat delta without a sign', () => {
		expect(formatDelta({ direction: 'flat', percent: 0, previous: 1, current: 1 })).toBe('0%')
	})

	it('renders a missing baseline as "New"', () => {
		expect(formatDelta({ direction: 'up', percent: null, previous: 0, current: 9 })).toBe('New')
	})
})
