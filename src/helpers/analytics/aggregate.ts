/**
 * Client-side roll-ups over the per-game analytics summaries.
 *
 * `listMyGamesAnalytics` returns one {@link GameAnalyticsSummary} per owned
 * game and nothing catalog-wide, so the studio overview derives its headline
 * numbers here rather than asking for a second endpoint.
 *
 * Two of the four roll-ups are exact and two are not, which matters for how
 * they're presented:
 *
 * - `impressions` / `pageviews` — plain sums. Exact.
 * - `ctr` — impressions-weighted. Also exact: per game `clicks = ctr ×
 *   impressions`, so weighting by impressions reconstructs the true
 *   `Σclicks / Σimpressions` without needing `clicks` on the wire.
 * - `avgDwellMs` — pageview-weighted. Approximate, because dwell is averaged
 *   over dwell events rather than pageviews. Close enough to rank by, not
 *   precise enough to quote to a decimal.
 *
 * Period-over-period deltas are deliberately limited to pageviews: `sparkline`
 * is the only series on the summary, so it's the only metric with a real
 * baseline to compare against. See {@link periodDelta}.
 */

import {
	type GameAnalyticsSummary,
	type TimeseriesPoint,
} from '@/helpers/analytics/types'

/** Catalog-wide headline numbers, derived from every owned game. */
export type CatalogTotals = {
	/** Number of games contributing to these totals. */
	games: number
	impressions: number
	pageviews: number
	/** Impressions-weighted click-through rate, 0..1. Exact. */
	ctr: number
	/** Pageview-weighted mean dwell time. Approximate. */
	avgDwellMs: number
}

export const EMPTY_CATALOG_TOTALS: CatalogTotals = {
	games: 0,
	impressions: 0,
	pageviews: 0,
	ctr: 0,
	avgDwellMs: 0,
}

/**
 * A period-over-period comparison.
 *
 * `percent` is `null` when the earlier half of the range was zero — there's no
 * baseline to divide by, and reporting an infinite increase would be a lie
 * dressed as precision. Callers render that case as "new" rather than a number.
 */
export type Delta = {
	direction: 'up' | 'down' | 'flat'
	/** Whole-percent change, or `null` when there's no baseline. */
	percent: number | null
	/** Total across the earlier half of the range. */
	previous: number
	/** Total across the later half of the range. */
	current: number
}

/**
 * Fewest points a series needs before a split comparison means anything. Below
 * this, each half is a single day and the "trend" is noise.
 */
export const MIN_DELTA_POINTS = 4

/** Coerce API-supplied numbers; missing or non-finite values count as zero. */
function safe(value: number | null | undefined): number {
	return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

function sumValues(points: TimeseriesPoint[]): number {
	return points.reduce((total, point) => total + safe(point?.value), 0)
}

/**
 * Roll every owned game up into catalog-wide totals.
 *
 * An empty (or absent) catalog yields {@link EMPTY_CATALOG_TOTALS} rather than
 * `NaN` — a studio with no games should see zeros, not a broken page.
 */
export function aggregateCatalog(
	games: GameAnalyticsSummary[] | null | undefined,
): CatalogTotals {
	if (!Array.isArray(games) || games.length === 0) {
		return EMPTY_CATALOG_TOTALS
	}

	let impressions = 0
	let pageviews = 0
	let clicks = 0
	let dwellWeighted = 0

	for (const game of games) {
		const gameImpressions = safe(game?.impressions)
		const gamePageviews = safe(game?.pageviews)

		impressions += gameImpressions
		pageviews += gamePageviews
		clicks += safe(game?.ctr) * gameImpressions
		dwellWeighted += safe(game?.avgDwellMs) * gamePageviews
	}

	return {
		games: games.length,
		impressions,
		pageviews,
		ctr: impressions > 0 ? clicks / impressions : 0,
		avgDwellMs: pageviews > 0 ? dwellWeighted / pageviews : 0,
	}
}

/**
 * Sum every game's pageview sparkline into one catalog-wide daily series.
 *
 * Games are only guaranteed to cover the days they had traffic, so this unions
 * the dates rather than assuming a shared axis, and returns them sorted
 * ascending (the ISO `YYYY-MM-DD` dates sort lexicographically).
 */
export function catalogPageviewSeries(
	games: GameAnalyticsSummary[] | null | undefined,
): TimeseriesPoint[] {
	if (!Array.isArray(games) || games.length === 0) {
		return []
	}

	const byDate = new Map<string, number>()

	for (const game of games) {
		if (!Array.isArray(game?.sparkline)) {
			continue
		}

		for (const point of game.sparkline) {
			if (!point?.date) {
				continue
			}

			byDate.set(point.date, (byDate.get(point.date) ?? 0) + safe(point.value))
		}
	}

	return [...byDate.entries()]
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([date, value]) => ({ date, value }))
}

/**
 * Compare the later half of a daily series against the earlier half.
 *
 * This is the only honest delta available from the overview payload: the
 * summary carries no previous-period totals, so the trend has to come out of
 * the series itself. An odd number of points drops the oldest day so the two
 * halves cover equal spans.
 *
 * Returns `null` when there aren't enough points to split, or when both halves
 * are zero (nothing happened; "0%" would imply something did).
 */
export function periodDelta(
	points: TimeseriesPoint[] | null | undefined,
): Delta | null {
	if (!Array.isArray(points) || points.length < MIN_DELTA_POINTS) {
		return null
	}

	const usable = points.length % 2 === 0 ? points : points.slice(1)
	const half = usable.length / 2
	const previous = sumValues(usable.slice(0, half))
	const current = sumValues(usable.slice(half))

	if (previous === 0 && current === 0) {
		return null
	}

	if (previous === 0) {
		return { direction: 'up', percent: null, previous, current }
	}

	// Round before deriving direction so sub-percent drift reads as flat rather
	// than as a trend that isn't there.
	const percent = Math.round(((current - previous) / previous) * 100) || 0

	return {
		direction: percent === 0 ? 'flat' : percent > 0 ? 'up' : 'down',
		percent,
		previous,
		current,
	}
}

/** Format a {@link Delta} for display, e.g. `+18%`, `-4%`, `0%`, `New`. */
export function formatDelta(delta: Delta | null): string | null {
	if (!delta) {
		return null
	}

	if (delta.percent === null) {
		return 'New'
	}

	if (delta.percent === 0) {
		return '0%'
	}

	return `${delta.percent > 0 ? '+' : ''}${delta.percent}%`
}
