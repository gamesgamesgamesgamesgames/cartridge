'use client'

import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, useState, useCallback } from 'react'

import { BoxArt } from '@/components/BoxArt/BoxArt'
import { Container } from '@/components/Container/Container'
import { Header } from '@/components/Header/Header'
import { TiltCard } from '@/components/TiltCard/TiltCard'
import * as API from '@/helpers/API'
import { type GameFeedGame } from '@/helpers/API'
import { GAME_APPLICATION_TYPES } from '@/constants/GAME_APPLICATION_TYPES'
import { type ApplicationType } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'

type RoleFeed = {
	role: 'developer' | 'publisher'
	label: string
	games: GameFeedGame[]
	cursor?: string
	totalCount: number
	isLoading: boolean
}

type Props = Readonly<{
	orgUri: string
}>

function getFirstReleaseYear(game: GameFeedGame): string | undefined {
	let earliest: string | undefined
	for (const release of game.releases ?? []) {
		for (const rd of release.releaseDates ?? []) {
			if (rd.releasedAt && (!earliest || rd.releasedAt < earliest)) {
				earliest = rd.releasedAt
			}
		}
	}
	return earliest?.slice(0, 4)
}

function GameGrid(props: {
	games: GameFeedGame[]
	cursor?: string
	isLoading: boolean
	onLoadMore: () => void
}) {
	const { games, cursor, isLoading, onLoadMore } = props
	const sentinelRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const el = sentinelRef.current
		if (!el || !cursor || isLoading) return

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) {
					onLoadMore()
				}
			},
			{ rootMargin: '600px' },
		)

		observer.observe(el)
		return () => observer.disconnect()
	}, [cursor, isLoading, onLoadMore])

	return (
		<>
			<div className={'grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'}>
				{games.map((game) => {
					const year = getFirstReleaseYear(game)
					const href = game.slug ? `/game/${game.slug}` : '#'

					return (
						<Link key={game.uri} href={href} className={'block'}>
							<TiltCard>
								<BoxArt gameRecord={game} />
							</TiltCard>
							<div className={'mt-1.5 px-0.5'}>
								<div className={'truncate text-sm font-medium'}>{game.name}</div>
								<div className={'flex justify-between truncate text-xs text-muted-foreground'}>
									{year && <span>{year}</span>}
									{game.applicationType && (
										<span className={'ml-auto'}>
											{GAME_APPLICATION_TYPES[game.applicationType as ApplicationType]?.name ?? game.applicationType}
										</span>
									)}
								</div>
							</div>
						</Link>
					)
				})}
			</div>

			<div ref={sentinelRef} />

			{isLoading && (
				<div className={'mt-4 flex justify-center py-4'}>
					<Loader2 className={'size-6 animate-spin text-muted-foreground'} />
				</div>
			)}
		</>
	)
}

export function OrgGameSections(props: Props) {
	const { orgUri } = props

	const [feeds, setFeeds] = useState<RoleFeed[]>([
		{ role: 'developer', label: 'Developed', games: [], totalCount: 0, isLoading: true },
		{ role: 'publisher', label: 'Published', games: [], totalCount: 0, isLoading: true },
	])
	const [initialLoaded, setInitialLoaded] = useState(false)

	useEffect(() => {
		Promise.all([
			API.getOrgDevelopedFeed(orgUri, { limit: 50 }),
			API.getOrgPublishedFeed(orgUri, { limit: 50 }),
		]).then(([devResult, pubResult]) => {
			setFeeds([
				{
					role: 'developer',
					label: 'Developed',
					games: devResult.feed.map((item) => item.game),
					cursor: devResult.cursor,
					totalCount: devResult.totalCount ?? devResult.feed.length,
					isLoading: false,
				},
				{
					role: 'publisher',
					label: 'Published',
					games: pubResult.feed.map((item) => item.game),
					cursor: pubResult.cursor,
					totalCount: pubResult.totalCount ?? pubResult.feed.length,
					isLoading: false,
				},
			])
			setInitialLoaded(true)
		}).catch(() => {
			setFeeds((prev) => prev.map((f) => ({ ...f, isLoading: false })))
			setInitialLoaded(true)
		})
	}, [orgUri])

	const loadMore = useCallback((role: 'developer' | 'publisher') => {
		setFeeds((prev) => {
			const feed = prev.find((f) => f.role === role)
			if (!feed || !feed.cursor || feed.isLoading) return prev
			return prev.map((f) => (f.role === role ? { ...f, isLoading: true } : f))
		})

		const currentFeed = feeds.find((f) => f.role === role)
		if (!currentFeed?.cursor || currentFeed.isLoading) return

		const fetcher = role === 'developer'
			? API.getOrgDevelopedFeed(orgUri, { limit: 50, cursor: currentFeed.cursor })
			: API.getOrgPublishedFeed(orgUri, { limit: 50, cursor: currentFeed.cursor })

		fetcher.then((result) => {
			setFeeds((prev) =>
				prev.map((f) =>
					f.role === role
						? {
								...f,
								games: [...f.games, ...result.feed.map((item) => item.game)],
								cursor: result.cursor,
								isLoading: false,
							}
						: f,
				),
			)
		}).catch(() => {
			setFeeds((prev) =>
				prev.map((f) => (f.role === role ? { ...f, isLoading: false } : f)),
			)
		})
	}, [feeds, orgUri])

	if (!initialLoaded) {
		return (
			<div className={'flex items-center justify-center py-24'}>
				<Loader2 className={'size-6 animate-spin text-muted-foreground'} />
			</div>
		)
	}

	const visibleFeeds = feeds
		.filter((f) => f.totalCount > 0)
		.sort((a, b) => b.totalCount - a.totalCount)

	if (visibleFeeds.length === 0) {
		return (
			<Container>
				<p className={'py-12 text-center text-muted-foreground'}>
					{'No games found for this company.'}
				</p>
			</Container>
		)
	}

	return (
		<>
			{visibleFeeds.map((feed, index) => (
				<section key={feed.role} className={index > 0 ? 'mt-16 md:mt-24' : undefined}>
					<div className={'sticky top-20 z-10 bg-secondary pb-4 pt-3'}>
						<Container isScrollable={false}>
							<Header className={'text-xl'} level={3}>
								{feed.label}
								<span className={'ml-2 text-base font-normal text-muted-foreground'}>
									{'('}{feed.totalCount}{')'}
								</span>
							</Header>
						</Container>
					</div>
					<Container>
						<GameGrid
							games={feed.games}
							cursor={feed.cursor}
							isLoading={feed.isLoading}
							onLoadMore={() => loadMore(feed.role)}
						/>
					</Container>
				</section>
			))}
		</>
	)
}
