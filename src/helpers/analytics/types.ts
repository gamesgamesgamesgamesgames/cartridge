/**
 * Read contract for the owner-facing analytics dashboard.
 *
 * Produced by the HappyView Lua read-proxy (`getGameAnalytics` /
 * `listMyGamesAnalytics`) — which authenticates the caller, verifies game
 * ownership, queries the ClickHouse rollup views, and merges in like/review/
 * list-add trends from `happyview_records` — and consumed by the dashboard.
 */

import { type AnalyticsRange } from '@/helpers/analytics/constants'

export type { AnalyticsRange }

/** A single day's value in a time series. `date` is 'YYYY-MM-DD' (UTC). */
export type TimeseriesPoint = {
	date: string
	value: number
}

/** A labelled count, e.g. a feed name or search term with its total. */
export type NamedCount = {
	name: string
	count: number
}

export type CtrBySurface = {
	surface: string
	impressions: number
	clicks: number
	ctr: number
}

/** Full analytics payload for one game. */
export type GameAnalytics = {
	slug: string
	name: string
	range: AnalyticsRange
	/** ISO timestamp the payload was generated (server-side). */
	generatedAt: string

	totals: {
		impressions: number
		clicks: number
		pageviews: number
		/** clicks / impressions, 0..1. */
		ctr: number
		avgDwellMs: number
		medianDwellMs: number
		avgScrollPct: number
		/** Mean of per-day unique visitors across the range (see privacy note). */
		avgDailyUniques: number
	}

	discovery: {
		/** Impressions per day split by surface. */
		impressionsOverTime: {
			date: string
			search: number
			feed: number
		}[]
		/** Which feeds surfaced the game, by impression count. */
		feedBreakdown: NamedCount[]
		/** Search terms that surfaced the game, by impression count. */
		topSearchTerms: NamedCount[]
	}

	attribution: {
		/** Pageviews by how the visitor arrived. */
		trafficSources: NamedCount[]
		/** Feeds that drove the most pageviews. */
		topReferrerFeeds: NamedCount[]
		ctrBySurface: CtrBySurface[]
	}

	engagement: {
		/** Dwell-time histogram buckets (e.g. '0-10s', '10-30s', ...). */
		dwellDistribution: NamedCount[]
		avgScrollPct: number
		/** Which tabs visitors viewed (reviews/media/...). */
		tabEngagement: NamedCount[]
		/** Unique visitors per day (daily-salted; not comparable across days). */
		dailyUniques: TimeseriesPoint[]
	}

	conversions: {
		/** Record creation trends from HappyView (authoritative counts over time). */
		recordTrends: {
			date: string
			likes: number
			reviews: number
			listAdds: number
		}[]
		/** Coarse discovery→engagement funnel from behavioral events. */
		funnel: {
			impressions: number
			pageviews: number
			actions: number
		}
	}
}

/** One row in the multi-game overview. */
export type GameAnalyticsSummary = {
	slug: string
	name: string
	impressions: number
	pageviews: number
	ctr: number
	avgDwellMs: number
	/** Pageviews per day for a compact sparkline. */
	sparkline: TimeseriesPoint[]
}

export type MyGamesAnalytics = {
	range: AnalyticsRange
	games: GameAnalyticsSummary[]
}
