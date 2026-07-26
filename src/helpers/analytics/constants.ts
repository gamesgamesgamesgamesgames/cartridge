/**
 * Shared analytics vocabulary.
 *
 * These lists are the single source of truth for the values that flow from the
 * browser analytics module, through the ingest collector, and into ClickHouse.
 * Keep them in sync with the ClickHouse column definitions in the
 * cartridge-infra repo (`clickhouse/migrations`).
 */

/** Where a game was shown when an impression/click occurred. */
export const SURFACES = ['search', 'feed', 'game_page'] as const
export type Surface = (typeof SURFACES)[number]

/** Kinds of events the browser reports. */
export const EVENT_TYPES = [
	'impression',
	'card_click',
	'pageview',
	'dwell',
	'action',
] as const
export type EventType = (typeof EVENT_TYPES)[number]

/** Engagement actions that feed the conversion funnel. */
export const ACTION_TYPES = ['like', 'review', 'list_add'] as const
export type ActionType = (typeof ACTION_TYPES)[number]

/** How a visitor arrived on a game page. */
export const REFERRER_TYPES = ['feed', 'search', 'direct', 'external'] as const
export type ReferrerType = (typeof REFERRER_TYPES)[number]

/** Time ranges offered in the owner dashboard. */
export const ANALYTICS_RANGES = ['7d', '30d', '90d'] as const
export type AnalyticsRange = (typeof ANALYTICS_RANGES)[number]

export const ANALYTICS_RANGE_DAYS: Record<AnalyticsRange, number> = {
	'7d': 7,
	'30d': 30,
	'90d': 90,
}

/**
 * `feed_name` is intentionally a free (bounded) string rather than an enum so
 * new feeds can ship without a schema migration. Known values are listed for
 * reference and for friendly labels in the dashboard.
 */
export const KNOWN_FEED_NAMES = [
	'hot',
	'personalized',
	'recentlyUpdated',
	'recentlyReleased',
	'upcoming',
	'similar',
	'genre',
	'popular',
	'mostReviewed',
	'mostListed',
	'community',
	'orgDeveloped',
	'orgPublished',
] as const

/**
 * Same-origin endpoint the browser beacons events to. Deliberately neutral
 * (no "analytics"/"track"/"collect" tokens) so ad-blocker URL filters don't
 * drop first-party beacons.
 */
export const ANALYTICS_COLLECT_PATH = '/api/event'

/** sessionStorage key prefix used to stash click attribution for the next pageview. */
export const ATTRIBUTION_STASH_PREFIX = 'cartridge.analytics.src.'

/** Max events per beacon batch (mirrored in the ingest schema). */
export const MAX_EVENTS_PER_BATCH = 100
