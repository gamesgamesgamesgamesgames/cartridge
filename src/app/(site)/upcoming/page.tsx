import { type Metadata } from 'next'

import { HeroFeedSection, type HeroSlide } from '@/components/BrowsePage/HeroFeedSection'
import { Header } from '@/components/Header/Header'
import { UpcomingReleasesContent } from '@/components/UpcomingReleasesPage/UpcomingReleasesContent'
import * as API from '@/helpers/API'
import { type GameFeedGame } from '@/helpers/API'

export const metadata: Metadata = {
	title: 'Upcoming Releases',
	description: 'Browse upcoming game releases by month and year.',
}

const INITIAL_LIMIT = 100
const HERO_WINDOW_DAYS = 14
const HERO_MAX_SLIDES = 7

const HERO_ARTWORK_TYPES = new Set(['artwork'])

const HERO_SCREENSHOT_TYPES = new Set([
	'screenshot',
	'gameplayImage',
])

function addDaysToNowStr(nowStr: string, days: number): number {
	const y = parseInt(nowStr.slice(0, 4), 10)
	const m = parseInt(nowStr.slice(4, 6), 10) - 1
	const d = parseInt(nowStr.slice(6, 8), 10)
	const date = new Date(y, m, d + days)
	return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate()
}

function composeHeroSlides(games: GameFeedGame[], now: string): HeroSlide[] {
	const withArtwork = games.filter((game) => {
		const media = game.media ?? []
		return media.some(
			(item) =>
				HERO_ARTWORK_TYPES.has(item.mediaType ?? '') ||
				HERO_SCREENSHOT_TYPES.has(item.mediaType ?? ''),
		)
	})

	withArtwork.sort((a, b) => (b.likeCount ?? 0) - (a.likeCount ?? 0))

	const weekEnd = addDaysToNowStr(now, 7)

	return withArtwork.slice(0, HERO_MAX_SLIDES).map((game) => {
		let category = 'Coming Soon'
		const dateMatch = game.firstReleaseDate?.match(/^(\d{4})-(\d{2})-(\d{2})/)
		if (dateMatch) {
			const dateInt =
				parseInt(dateMatch[1], 10) * 10000 +
				parseInt(dateMatch[2], 10) * 100 +
				parseInt(dateMatch[3], 10)
			category = dateInt <= weekEnd ? 'This Week' : 'Next Week'
		}
		return { game, category }
	})
}

export default async function UpcomingReleasesPage() {
	const now = API.getLocalNow()
	const heroTo = addDaysToNowStr(now, HERO_WINDOW_DAYS)

	const [heroResult, result] = await Promise.all([
		API.getUpcomingReleases(100, undefined, now, false, undefined, heroTo),
		API.getUpcomingReleases(INITIAL_LIMIT, undefined, now),
	])

	const heroSlides = composeHeroSlides(heroResult.feed, now)

	return (
		<div className={'flex flex-col pb-16'}>
			{heroSlides.length > 0 && (
				<HeroFeedSection slides={heroSlides} />
			)}

			<div className={'px-4 pb-4 pt-8 md:px-10 lg:px-16'}>
				<Header level={1}>
					{'Upcoming Releases'}
				</Header>
			</div>

			<UpcomingReleasesContent
				initialGames={result.feed}
				initialCursor={result.cursor}
				now={now}
			/>
		</div>
	)
}
