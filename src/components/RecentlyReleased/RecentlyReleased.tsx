'use client'

import Link from 'next/link'
import { BrowseGameCard } from '@/components/BrowsePage/BrowseGameCard'
import { Header } from '@/components/Header/Header'
import { Scroller } from '@/components/ui/scroller'
import { type GameFeedGame } from '@/helpers/API'

type Props = Readonly<{
	id?: string
	games: GameFeedGame[]
	now?: string
	seeAllHref?: string
}>

function getFirstReleaseDate(game: GameFeedGame): string | undefined {
	if (game.firstReleaseDate) return game.firstReleaseDate

	let earliest: string | undefined
	for (const release of game.releases ?? []) {
		for (const rd of release.releaseDates ?? []) {
			if (rd.releasedAt && (!earliest || rd.releasedAt < earliest)) {
				earliest = rd.releasedAt
			}
		}
	}
	return earliest
}

function formatReleaseDate(date: string): string {
	const match = date.match(/^(\d{4})-(\d{2})-(\d{2})/)
	if (match) {
		return new Date(
			`${match[1]}-${match[2]}-${match[3]}T00:00:00`,
		).toLocaleDateString(undefined, {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		})
	}

	const monthMatch = date.match(/^(\d{4})-(\d{2})$/)
	if (monthMatch) {
		return new Date(
			`${monthMatch[1]}-${monthMatch[2]}-01T00:00:00`,
		).toLocaleDateString(undefined, {
			month: 'short',
			year: 'numeric',
		})
	}

	return date
}

export function RecentlyReleased(props: Props) {
	const { id, games, now, seeAllHref } = props

	const thirtyDaysAgo = now ? new Date(now).getTime() - 30 * 24 * 60 * 60 * 1000 : 0

	if (games.length === 0) return null

	return (
		<section id={id} className={'scroll-mt-32'}>
			<div className={'mb-4 flex items-baseline justify-between px-4 md:px-10 lg:px-16'}>
				<Header
					className={'text-xl'}
					level={3}>
					{'Recently Released'}
				</Header>
				{seeAllHref && (
					<Link
						href={seeAllHref}
						className={'text-sm font-medium text-primary hover:underline'}>
						{'See all'}
					</Link>
				)}
			</div>

			<Scroller
				aria-label={'Recently Released games'}
				orientation={'horizontal'}
				hideScrollbar
				withNavigation
				size={60}
				scrollStep={176}
				className={'flex gap-4 px-4 py-4 md:px-10 lg:px-16'}>
				{games.map((game) => {
					const releaseDate = getFirstReleaseDate(game)
					const isNew = now && releaseDate ? new Date(releaseDate).getTime() > thirtyDaysAgo : false
					return (
						<BrowseGameCard
							key={game.uri}
							game={game}
							subtitle={releaseDate ? formatReleaseDate(releaseDate) : undefined}
							badge={isNew ? 'New' : undefined}
						/>
					)
				})}
			</Scroller>
		</section>
	)
}
