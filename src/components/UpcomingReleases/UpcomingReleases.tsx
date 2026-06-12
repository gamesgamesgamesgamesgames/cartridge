'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

import { BoxArt } from '@/components/BoxArt/BoxArt'
import { Header } from '@/components/Header/Header'
import { TiltCard } from '@/components/TiltCard/TiltCard'
import { Scroller } from '@/components/ui/scroller'
import { Skeleton } from '@/components/ui/skeleton'
import * as API from '@/helpers/API'
import { type GameFeedGame } from '@/helpers/API'

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

function LoadingSkeleton() {
	return (
		<div className={'flex gap-4 px-4 py-4 md:px-10 lg:px-16'} aria-hidden={'true'}>
			{Array.from({ length: 7 }, (_, i) => (
				<div key={i} className={'w-40 shrink-0'}>
					<Skeleton className={'aspect-[3/4] w-full rounded-lg'} />
					<Skeleton className={'mt-1.5 h-4 w-3/4'} />
					<Skeleton className={'mt-1 h-3 w-1/2'} />
				</div>
			))}
		</div>
	)
}

export function UpcomingReleases() {
	const [games, setGames] = useState<GameFeedGame[]>([])
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const now = API.getLocalNow()
		API.getUpcomingReleases(20, undefined, now, true)
			.then((result) => {
				setGames(result.feed)
			})
			.finally(() => {
				setIsLoading(false)
			})
	}, [])

	if (!isLoading && games.length === 0) return null

	return (
		<section className={'relative bg-secondary pb-12'}>
			<div className={'-mt-30'}>
				<div className={'mb-2 flex items-baseline justify-between px-4 pt-4 md:px-10 lg:px-16'}>
					<Header level={3}>
						{'Upcoming Releases'}
					</Header>
					<Link
						href={'/upcoming'}
						className={'text-sm font-medium text-primary hover:underline'}>
						{'View all'}
					</Link>
				</div>

				{isLoading ? (
					<>
						<div className={'sr-only'} role={'status'} aria-live={'polite'}>
							{'Loading upcoming releases'}
						</div>
						<LoadingSkeleton />
					</>
				) : (
					<Scroller
						orientation={'horizontal'}
						hideScrollbar
						withNavigation
						scrollStep={176}
						className={'flex gap-4 px-4 py-4 md:px-10 lg:px-16'}>
						{games.map((game) => {
							const releaseDate = getFirstReleaseDate(game)
							const href = game.slug ? `/game/${game.slug}` : '#'

							return (
								<Link
									key={game.uri}
									href={href}
									className={'block w-40 shrink-0'}>
									<TiltCard>
										<BoxArt gameRecord={game} />
									</TiltCard>
									<div className={'mt-1.5 px-0.5'}>
										<div className={'truncate text-sm font-medium'}>
											{game.name}
										</div>
										{releaseDate && (
											<div className={'truncate text-xs text-muted-foreground'}>
												{formatReleaseDate(releaseDate)}
											</div>
										)}
									</div>
								</Link>
							)
						})}
					</Scroller>
				)}
			</div>
		</section>
	)
}
