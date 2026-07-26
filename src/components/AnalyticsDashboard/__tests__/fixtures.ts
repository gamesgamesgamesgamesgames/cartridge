// Local imports
import {
	type GameAnalytics,
	type GameAnalyticsSummary,
} from '@/helpers/analytics/types'

/** A realistic, fully-populated per-game payload for tests. */
export const GAME_ANALYTICS_FIXTURE: GameAnalytics = {
	slug: 'starbound-drifter',
	name: 'Starbound Drifter',
	range: '30d',
	generatedAt: '2026-07-20T12:00:00.000Z',
	totals: {
		impressions: 48250,
		clicks: 3120,
		pageviews: 2740,
		ctr: 0.0647,
		avgDwellMs: 92000,
		medianDwellMs: 61000,
		avgScrollPct: 58,
		avgDailyUniques: 214,
	},
	discovery: {
		impressionsOverTime: [
			{ date: '2026-07-14', search: 420, feed: 980 },
			{ date: '2026-07-15', search: 510, feed: 1120 },
			{ date: '2026-07-16', search: 470, feed: 1040 },
			{ date: '2026-07-17', search: 630, feed: 1380 },
			{ date: '2026-07-18', search: 590, feed: 1250 },
			{ date: '2026-07-19', search: 720, feed: 1490 },
			{ date: '2026-07-20', search: 680, feed: 1410 },
		],
		feedBreakdown: [
			{ name: 'hot', count: 12400 },
			{ name: 'personalized', count: 8300 },
			{ name: 'recentlyReleased', count: 5100 },
			{ name: 'similar', count: 3600 },
		],
		topSearchTerms: [
			{ name: 'space roguelike', count: 940 },
			{ name: 'starbound drifter', count: 610 },
			{ name: 'pixel space game', count: 380 },
		],
	},
	attribution: {
		trafficSources: [
			{ name: 'feed', count: 1580 },
			{ name: 'search', count: 720 },
			{ name: 'direct', count: 290 },
			{ name: 'external', count: 150 },
		],
		topReferrerFeeds: [
			{ name: 'hot', count: 890 },
			{ name: 'personalized', count: 470 },
			{ name: 'similar', count: 220 },
		],
		ctrBySurface: [
			{ surface: 'feed', impressions: 34200, clicks: 2100, ctr: 0.0614 },
			{ surface: 'search', impressions: 11800, clicks: 890, ctr: 0.0754 },
			{ surface: 'game_page', impressions: 2250, clicks: 130, ctr: 0.0578 },
		],
	},
	engagement: {
		dwellDistribution: [
			{ name: '0-10s', count: 640 },
			{ name: '10-30s', count: 820 },
			{ name: '30-60s', count: 710 },
			{ name: '60s+', count: 570 },
		],
		avgScrollPct: 58,
		tabEngagement: [
			{ name: 'media', count: 1240 },
			{ name: 'reviews', count: 880 },
			{ name: 'similar', count: 540 },
		],
		dailyUniques: [
			{ date: '2026-07-14', value: 180 },
			{ date: '2026-07-15', value: 205 },
			{ date: '2026-07-16', value: 198 },
			{ date: '2026-07-17', value: 240 },
			{ date: '2026-07-18', value: 222 },
			{ date: '2026-07-19', value: 261 },
			{ date: '2026-07-20', value: 249 },
		],
	},
	conversions: {
		recordTrends: [
			{ date: '2026-07-14', likes: 24, reviews: 6, listAdds: 11 },
			{ date: '2026-07-15', likes: 31, reviews: 8, listAdds: 14 },
			{ date: '2026-07-16', likes: 28, reviews: 5, listAdds: 12 },
			{ date: '2026-07-17', likes: 44, reviews: 11, listAdds: 19 },
			{ date: '2026-07-18', likes: 39, reviews: 9, listAdds: 16 },
			{ date: '2026-07-19', likes: 52, reviews: 14, listAdds: 23 },
			{ date: '2026-07-20', likes: 48, reviews: 12, listAdds: 21 },
		],
		funnel: {
			impressions: 48250,
			pageviews: 2740,
			actions: 430,
		},
	},
}

/** An all-zero payload — the per-game empty-state trigger. */
export const EMPTY_GAME_ANALYTICS: GameAnalytics = {
	slug: 'ghost-game',
	name: 'Ghost Game',
	range: '30d',
	generatedAt: '2026-07-20T12:00:00.000Z',
	totals: {
		impressions: 0,
		clicks: 0,
		pageviews: 0,
		ctr: 0,
		avgDwellMs: 0,
		medianDwellMs: 0,
		avgScrollPct: 0,
		avgDailyUniques: 0,
	},
	discovery: {
		impressionsOverTime: [],
		feedBreakdown: [],
		topSearchTerms: [],
	},
	attribution: {
		trafficSources: [],
		topReferrerFeeds: [],
		ctrBySurface: [],
	},
	engagement: {
		dwellDistribution: [],
		avgScrollPct: 0,
		tabEngagement: [],
		dailyUniques: [],
	},
	conversions: {
		recordTrends: [],
		funnel: { impressions: 0, pageviews: 0, actions: 0 },
	},
}

/** Overview rows (deliberately out of impressions order to test sorting). */
export const MY_GAMES_SUMMARIES: GameAnalyticsSummary[] = [
	{
		slug: 'nebula-knight',
		name: 'Nebula Knight',
		impressions: 12800,
		pageviews: 940,
		ctr: 0.052,
		avgDwellMs: 74000,
		sparkline: [
			{ date: '2026-07-18', value: 120 },
			{ date: '2026-07-19', value: 160 },
			{ date: '2026-07-20', value: 140 },
		],
	},
	{
		slug: 'starbound-drifter',
		name: 'Starbound Drifter',
		impressions: 48250,
		pageviews: 2740,
		ctr: 0.0647,
		avgDwellMs: 92000,
		sparkline: [
			{ date: '2026-07-18', value: 220 },
			{ date: '2026-07-19', value: 261 },
			{ date: '2026-07-20', value: 249 },
		],
	},
	{
		slug: 'pixel-forge',
		name: 'Pixel Forge',
		impressions: 3100,
		pageviews: 210,
		ctr: 0.041,
		avgDwellMs: 53000,
		sparkline: [
			{ date: '2026-07-18', value: 30 },
			{ date: '2026-07-19', value: 44 },
			{ date: '2026-07-20', value: 38 },
		],
	},
]
