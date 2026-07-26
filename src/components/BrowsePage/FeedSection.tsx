'use client'

import Link from 'next/link'

import { BrowseGameCard } from './BrowseGameCard'
import { Header } from '@/components/Header/Header'
import { ImpressionSurfaceProvider } from '@/components/analytics/ImpressionSurface'
import { Scroller } from '@/components/ui/scroller'
import { type CommunityFeedItem, type GameFeedGame } from '@/helpers/API'

export type ActivityMap = Map<string, CommunityFeedItem[]>

type Props = Readonly<{
	id?: string
	title: string
	games: GameFeedGame[]
	cardSize?: 'default' | 'large'
	badge?: string
	seeAllHref?: string
	showGenres?: boolean
	activityMap?: ActivityMap
	/** Canonical feed identifier for analytics; defaults to `id`/`title`. */
	feedName?: string
}>

export function FeedSection(props: Props) {
	const { id, title, games, cardSize = 'default', badge, seeAllHref, showGenres, activityMap, feedName } = props

	if (games.length === 0) return null

	const feed = feedName ?? id ?? title

	return (
		<section id={id} className={'scroll-mt-32'}>
			<div className={'mb-4 flex items-baseline justify-between px-4 md:px-10 lg:px-16'}>
				<Header
					className={'text-xl'}
					level={3}>
					{title}
				</Header>
				{seeAllHref && (
					<Link
						href={seeAllHref}
						className={'text-sm font-medium text-primary hover:underline'}>
						{'See all'}
					</Link>
				)}
			</div>

			<ImpressionSurfaceProvider value={{ surface: 'feed', feedName: feed }}>
				<Scroller
					aria-label={`${title} games`}
					orientation={'horizontal'}
					hideScrollbar
					withNavigation
					size={60}
					scrollStep={cardSize === 'large' ? 240 : 176}
					className={'flex gap-4 px-4 py-4 md:px-10 lg:px-16'}>
					{games.map((game, index) => (
						<BrowseGameCard
							key={game.uri}
							game={game}
							size={cardSize}
							badge={badge}
							showGenres={showGenres}
							recentActivity={activityMap?.get(game.uri)}
							position={index}
						/>
					))}
				</Scroller>
			</ImpressionSurfaceProvider>
		</section>
	)
}
