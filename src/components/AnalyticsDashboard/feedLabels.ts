/**
 * Friendly display labels for the (bounded, free-string) feed names. Unknown
 * feeds fall back to a de-camel-cased title so a newly shipped feed still reads
 * sensibly without a code change.
 */
const FEED_LABELS: Record<string, string> = {
	hot: 'Hot',
	personalized: 'For you',
	recentlyUpdated: 'Recently updated',
	recentlyReleased: 'Recently released',
	upcoming: 'Upcoming',
	similar: 'Similar games',
	genre: 'Genre',
	popular: 'Popular',
	mostReviewed: 'Most reviewed',
	mostListed: 'Most listed',
	community: 'Community',
	orgDeveloped: 'Developer page',
	orgPublished: 'Publisher page',
}

/** Traffic-source / referrer labels. */
const SOURCE_LABELS: Record<string, string> = {
	feed: 'Feed',
	search: 'Search',
	direct: 'Direct',
	external: 'External',
}

export function feedLabel(name: string): string {
	if (FEED_LABELS[name]) {
		return FEED_LABELS[name]
	}

	const spaced = name
		.replace(/([a-z])([A-Z])/g, '$1 $2')
		.replace(/[_-]+/g, ' ')
		.trim()

	return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

export function sourceLabel(name: string): string {
	return SOURCE_LABELS[name] ?? feedLabel(name)
}
