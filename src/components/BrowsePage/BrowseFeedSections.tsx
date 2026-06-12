'use client'

import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { LogIn, RefreshCw } from 'lucide-react'
import Link from 'next/link'

import * as API from '@/helpers/API'
import { type CommunityFeedItem, type GameFeedGame, type PlatformStats } from '@/helpers/API'
import { isAuthenticated } from '@/helpers/oauth'
import { Button } from '@/components/ui/button'
import { GAME_GENRES } from '@/constants/GAME_GENRES'
import { BrowseNav, type BrowseNavItem } from './BrowseNav'
import { BuzzingSection } from './BuzzingSection'
import { CommunityActivitySection } from './CommunityActivitySection'
import { CommunityFooter } from './CommunityFooter'
import { FeedSection, type ActivityMap } from './FeedSection'
import { FeedSectionSkeleton } from './FeedSectionSkeleton'
import { HeroFeedSection, type HeroSlide } from './HeroFeedSection'
import { RecentlyReleased } from '@/components/RecentlyReleased/RecentlyReleased'

// ---------------------------------------------------------------------------
// Feed state management
// ---------------------------------------------------------------------------

type FeedState<T> =
	| { status: 'loading'; data: T }
	| { status: 'ok'; data: T }
	| { status: 'error'; data: T }

type FeedAction<T> =
	| { type: 'loading' }
	| { type: 'ok'; data: T }
	| { type: 'error' }

function feedReducer<T>(state: FeedState<T>, action: FeedAction<T>): FeedState<T> {
	switch (action.type) {
		case 'loading': return { ...state, status: 'loading' }
		case 'ok': return { status: 'ok', data: action.data }
		case 'error': return { ...state, status: 'error' }
	}
}

function useFeed<T>(
	fetcher: () => Promise<T>,
	initialData: T,
): { data: T; loading: boolean; error: boolean; retry: () => void } {
	const [state, dispatch] = useReducer(feedReducer<T>, { status: 'loading', data: initialData })
	const mountedRef = useRef(true)

	useEffect(() => {
		mountedRef.current = true
		fetcher()
			.then((data) => { if (mountedRef.current) dispatch({ type: 'ok', data }) })
			.catch(() => { if (mountedRef.current) dispatch({ type: 'error' }) })
		return () => { mountedRef.current = false }
	}, [fetcher])

	const retry = useCallback(() => {
		dispatch({ type: 'loading' })
		fetcher()
			.then((data) => { if (mountedRef.current) dispatch({ type: 'ok', data }) })
			.catch(() => { if (mountedRef.current) dispatch({ type: 'error' }) })
	}, [fetcher])

	return {
		data: state.data,
		loading: state.status === 'loading',
		error: state.status === 'error',
		retry,
	}
}

function FeedError(props: { title: string; onRetry: () => void }) {
	return (
		<section className={'px-4 md:px-10 lg:px-16'}>
			<div className={'flex flex-col items-center gap-3 rounded-lg border border-border bg-card/50 py-8'}>
				<p className={'text-sm text-muted-foreground'}>
					{`Couldn't load ${props.title}.`}
				</p>
				<Button
					variant={'outline'}
					size={'sm'}
					onClick={props.onRetry}>
					<RefreshCw className={'size-3.5'} aria-hidden={'true'} />
					{'Try again'}
				</Button>
			</div>
		</section>
	)
}

// ---------------------------------------------------------------------------
// Hero slide composition
// ---------------------------------------------------------------------------

function hasHeroMedia(game: GameFeedGame): boolean {
	return (game.media?.length ?? 0) > 0
}

function composeHeroSlides(
	hot: GameFeedGame[],
	personalized: GameFeedGame[],
	recentlyReleased: GameFeedGame[],
	upcoming: GameFeedGame[],
): HeroSlide[] {
	const seen = new Set<string>()

	const take = (games: GameFeedGame[], category: string, count: number): HeroSlide[] => {
		const result: HeroSlide[] = []
		for (const game of games) {
			if (result.length >= count) break
			if (seen.has(game.uri)) continue
			if (!hasHeroMedia(game)) continue
			seen.add(game.uri)
			result.push({ game, category })
		}
		return result
	}

	const hasPersonalized = personalized.length > 0

	const hotSlides = take(hot, 'Hot This Week', hasPersonalized ? 2 : 4)
	const personalizedSlides = hasPersonalized ? take(personalized, 'For You', 2) : []
	const releasedSlides = take(recentlyReleased, 'Just Released', hasPersonalized ? 2 : 2)
	const upcomingSlides = take(upcoming, 'Coming Soon', 1)

	const pools = [hotSlides, personalizedSlides, releasedSlides, upcomingSlides].filter((p) => p.length > 0)
	const indices = pools.map(() => 0)
	const result: HeroSlide[] = []

	while (result.length < 7) {
		let added = false
		for (let i = 0; i < pools.length; i++) {
			if (result.length >= 7) break
			if (indices[i] < pools[i].length) {
				result.push(pools[i][indices[i]])
				indices[i]++
				added = true
			}
		}
		if (!added) break
	}

	return result
}

// ---------------------------------------------------------------------------
// Sign-in prompt for unauthenticated users
// ---------------------------------------------------------------------------

function WelcomeBanner() {
	return (
		<section className={'px-4 md:px-10 lg:px-16'}>
			<div className={'rounded-xl border border-border/50 bg-card/30 px-6 py-6'}>
				<p className={'font-[family-name:var(--font-cartridge)] text-lg font-bold leading-snug md:text-xl'}>
					{'Every game deserves a home. This is the catalog.'}
				</p>
				<p className={'mt-1.5 max-w-lg text-sm text-muted-foreground'}>
					{'Browse, review, and build lists with a community of players. All open, all yours.'}
				</p>
				<div className={'mt-4 flex gap-3'}>
					<Button asChild size={'sm'}>
						<Link href={'/login'}>
							<LogIn className={'size-4'} aria-hidden={'true'} />
							{'Sign in to get started'}
						</Link>
					</Button>
				</div>
			</div>
		</section>
	)
}


// ---------------------------------------------------------------------------
// Genre feed configuration
// ---------------------------------------------------------------------------

const GENRE_FEED_ORDER = [
	'rpg',
	'shooter',
	'platform',
	'puzzle',
	'simulator',
	'racing',
] as const

function genreTitle(genre: string): string {
	return GAME_GENRES[genre]?.name ?? genre
}

function genreSeeAllHref(genre: string): string {
	return `/search?genres=${genre}`
}

type GenreFeedsResult = {
	loading: boolean
	genres: Array<{ genre: string; games: GameFeedGame[] }>
}

function useGenreFeeds(): GenreFeedsResult {
	const fetcher = useCallback(async () => {
		const results = await Promise.all(
			GENRE_FEED_ORDER.map(async (genre) => ({
				genre,
				games: await API.getGamesByGenre(genre, 20),
			})),
		)
		return results.filter((r) => r.games.length > 0)
	}, [])

	const feed = useFeed(fetcher, [] as Array<{ genre: string; games: GameFeedGame[] }>)

	return { loading: feed.loading, genres: feed.data }
}

// ---------------------------------------------------------------------------
// BrowseFeedSections
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Section ID constants
// ---------------------------------------------------------------------------

const SECTION_IDS = {
	forYou: 'browse-for-you',
	activity: 'browse-activity',
	buzzing: 'browse-buzzing',
	popular: 'browse-popular',
	mostReviewed: 'browse-most-reviewed',
	upcoming: 'browse-upcoming',
	recentlyReleased: 'browse-recently-released',
	collectorsPicks: 'browse-collectors-picks',
	recentlyUpdated: 'browse-recently-updated',
	community: 'browse-community',
} as const

function genreSectionId(genre: string): string {
	return `browse-genre-${genre}`
}

export function BrowseFeedSections() {
	const now = API.getLocalNow()
	const authed = isAuthenticated()

	// Core feeds
	const hot = useFeed(
		useCallback(() => API.getHotGames(20), []),
		[] as GameFeedGame[],
	)
	const personalized = useFeed(
		useCallback(() => {
			if (!isAuthenticated()) return Promise.resolve([] as GameFeedGame[])
			return API.getPersonalizedGames(20)
		}, []),
		[] as GameFeedGame[],
	)
	const upcoming = useFeed(
		useCallback(() => API.getUpcomingReleases(20, undefined, now, true).then((r) => r.feed), [now]),
		[] as GameFeedGame[],
	)
	const recentlyReleased = useFeed(
		useCallback(() => API.getRecentlyReleased(20, undefined, now).then((r) => r.feed), [now]),
		[] as GameFeedGame[],
	)
	const recent = useFeed(
		useCallback(() => API.getRecentlyUpdatedGames(20), []),
		[] as GameFeedGame[],
	)
	const communityFeed = useFeed(
		useCallback(() => API.getCommunityFeed(20).then((r) => r.feed), []),
		[] as CommunityFeedItem[],
	)
	const stats = useFeed(
		useCallback(() => API.getStats(), []),
		null as PlatformStats | null,
	)

	// Engagement feeds
	const popular = useFeed(
		useCallback(() => API.getPopularGames(20).then((r) => r.games), []),
		[] as GameFeedGame[],
	)
	const mostReviewed = useFeed(
		useCallback(() => API.getMostReviewedGames(20), []),
		[] as GameFeedGame[],
	)
	const mostListed = useFeed(
		useCallback(() => API.getMostListedGames(20), []),
		[] as GameFeedGame[],
	)

	// Genre feeds
	const genreFeeds = useGenreFeeds()

	// Hero composition
	const heroLoading = hot.loading || recentlyReleased.loading || upcoming.loading || personalized.loading
	const heroSlides = useMemo(
		() => composeHeroSlides(hot.data, personalized.data, recentlyReleased.data, upcoming.data),
		[hot.data, personalized.data, recentlyReleased.data, upcoming.data],
	)
	const heroEmpty = !heroLoading && heroSlides.length === 0

	// Build activity map: gameUri → recent activity items
	const activityMap = useMemo<ActivityMap>(() => {
		const map: ActivityMap = new Map()
		for (const item of communityFeed.data) {
			if (!item.game?.uri) continue
			const existing = map.get(item.game.uri)
			if (existing) {
				existing.push(item)
			} else {
				map.set(item.game.uri, [item])
			}
		}
		return map
	}, [communityFeed.data])

	// Split genres into two groups for interleaving throughout the page
	const topGenres = genreFeeds.genres.slice(0, 3)
	const bottomGenres = genreFeeds.genres.slice(3, 6)

	// Build nav items from sections that have data
	const navItems = useMemo<BrowseNavItem[]>(() => {
		const items: BrowseNavItem[] = []

		if (authed && personalized.data.length > 0) {
			items.push({ id: SECTION_IDS.forYou, label: 'For You' })
		}
		if (hot.data.length > 0) {
			items.push({ id: SECTION_IDS.buzzing, label: 'Buzzing' })
		}
		if (popular.data.length > 0) {
			items.push({ id: SECTION_IDS.popular, label: 'Popular' })
		}
		for (const { genre } of topGenres) {
			items.push({ id: genreSectionId(genre), label: genreTitle(genre) })
		}
		if (mostReviewed.data.length > 0) {
			items.push({ id: SECTION_IDS.mostReviewed, label: 'Reviewed' })
		}
		items.push({ id: SECTION_IDS.upcoming, label: 'Upcoming' })
		items.push({ id: SECTION_IDS.recentlyReleased, label: 'New Releases' })
		if (communityFeed.data.length > 0) {
			items.push({ id: SECTION_IDS.activity, label: 'Activity' })
		}
		for (const { genre } of bottomGenres) {
			items.push({ id: genreSectionId(genre), label: genreTitle(genre) })
		}
		if (mostListed.data.length > 0) {
			items.push({ id: SECTION_IDS.collectorsPicks, label: "Collectors'" })
		}
		items.push({ id: SECTION_IDS.recentlyUpdated, label: 'Updated' })

		return items
	}, [
		authed,
		personalized.data.length,
		communityFeed.data.length,
		hot.data.length,
		popular.data.length,
		mostReviewed.data.length,
		mostListed.data.length,
		topGenres,
		bottomGenres,
	])

	return (
		<>
			{heroLoading ? (
				<FeedSectionSkeleton variant={'hero'} />
			) : heroEmpty ? (
				<FeedError
					title={'Featured'}
					onRetry={() => {
						hot.retry()
						recentlyReleased.retry()
						upcoming.retry()
						personalized.retry()
					}}
				/>
			) : (
				<HeroFeedSection slides={heroSlides} />
			)}

			<BrowseNav items={navItems} />

			<div className={'flex flex-col gap-8 pt-10 md:gap-14 md:pt-20'}>
				{/* Welcome copy for first-time visitors */}
				{!authed && <WelcomeBanner />}

				{/* Personalized section (authenticated users only) */}
				{personalized.loading ? (
					<FeedSectionSkeleton cardWidth={'large'} />
				) : personalized.data.length > 0 ? (
					<FeedSection
						id={SECTION_IDS.forYou}
						title={'For You'}
						games={personalized.data}
						cardSize={'large'}
						showGenres
						activityMap={activityMap}
					/>
				) : authed ? (
					<section className={'px-4 md:px-10 lg:px-16'}>
						<div className={'rounded-xl border border-border/50 bg-card/30 px-6 py-5'}>
							<p className={'text-sm font-medium'}>{'Your feed is empty for now.'}</p>
							<p className={'mt-1 text-sm text-muted-foreground'}>
								{'Like a few games and we’ll start building recommendations for you.'}
							</p>
						</div>
					</section>
				) : null}

				{/* Buzzing — community-driven trending */}
				{hot.loading ? (
					<FeedSectionSkeleton variant={'buzzing'} />
				) : hot.data.length > 0 ? (
					<BuzzingSection id={SECTION_IDS.buzzing} games={hot.data} />
				) : null}

				{/* Popular Right Now — CCU-based */}
				{popular.loading ? (
					<FeedSectionSkeleton />
				) : popular.data.length > 0 ? (
					<FeedSection
						id={SECTION_IDS.popular}
						title={'Popular Right Now'}
						games={popular.data}
						activityMap={activityMap}
					/>
				) : null}

				{/* First batch of genre rows */}
				{genreFeeds.loading ? (
					<>
						<FeedSectionSkeleton />
						<FeedSectionSkeleton />
						<FeedSectionSkeleton />
					</>
				) : topGenres.map(({ genre, games }) => (
					<FeedSection
						key={genre}
						id={genreSectionId(genre)}
						title={genreTitle(genre)}
						games={games}
						seeAllHref={genreSeeAllHref(genre)}
						showGenres
						activityMap={activityMap}
					/>
				))}

				{/* Most Reviewed */}
				{mostReviewed.loading ? (
					<FeedSectionSkeleton />
				) : mostReviewed.data.length > 0 ? (
					<FeedSection
						id={SECTION_IDS.mostReviewed}
						title={'Most Reviewed'}
						games={mostReviewed.data}
						activityMap={activityMap}
					/>
				) : null}

				{/* Upcoming — tinted band */}
				<div id={SECTION_IDS.upcoming} className={'scroll-mt-32 bg-card/40 py-6 md:py-10'}>
					{upcoming.loading ? (
						<FeedSectionSkeleton />
					) : upcoming.error ? (
						<FeedError title={'Upcoming'} onRetry={upcoming.retry} />
					) : (
						<FeedSection
							title={'Upcoming'}
							games={upcoming.data}
							seeAllHref={'/upcoming'}
							showGenres
							activityMap={activityMap}
						/>
					)}
				</div>

				{recentlyReleased.loading ? (
					<FeedSectionSkeleton />
				) : recentlyReleased.error ? (
					<FeedError title={'Recently Released'} onRetry={recentlyReleased.retry} />
				) : (
					<RecentlyReleased
						id={SECTION_IDS.recentlyReleased}
						games={recentlyReleased.data}
						now={now}
						seeAllHref={'/search?sort=recent'}
					/>
				)}

				{/* Community activity — placed mid-page to break up genre rows */}
				{communityFeed.loading ? (
					<FeedSectionSkeleton variant={'activity'} />
				) : communityFeed.data.length > 0 ? (
					<CommunityActivitySection id={SECTION_IDS.activity} items={communityFeed.data} />
				) : null}

				{/* Second batch of genre rows */}
				{!genreFeeds.loading && bottomGenres.map(({ genre, games }) => (
					<FeedSection
						key={genre}
						id={genreSectionId(genre)}
						title={genreTitle(genre)}
						games={games}
						seeAllHref={genreSeeAllHref(genre)}
						showGenres
						activityMap={activityMap}
					/>
				))}

				{/* Collectors' Picks — most listed */}
				{mostListed.loading ? (
					<FeedSectionSkeleton />
				) : mostListed.data.length > 0 ? (
					<FeedSection
						id={SECTION_IDS.collectorsPicks}
						title={"Collectors' Picks"}
						games={mostListed.data}
						activityMap={activityMap}
					/>
				) : null}

				{recent.loading ? (
					<FeedSectionSkeleton />
				) : recent.error ? (
					<FeedError title={'Recently Updated'} onRetry={recent.retry} />
				) : (
					<FeedSection
						id={SECTION_IDS.recentlyUpdated}
						title={'Recently Updated'}
						games={recent.data}
						seeAllHref={'/search?sort=updated'}
						activityMap={activityMap}
					/>
				)}

				{/* Community-flavored footer with stats */}
				<CommunityFooter id={SECTION_IDS.community} stats={stats.data} />
			</div>
		</>
	)
}
