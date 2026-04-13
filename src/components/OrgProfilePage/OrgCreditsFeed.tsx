'use client'

// Module imports
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'

// Local imports
import { BoxArt } from '@/components/BoxArt/BoxArt'
import { TiltCard } from '@/components/TiltCard/TiltCard'
import * as API from '@/helpers/API'
import { type GameFeedGame } from '@/helpers/API'
import { GAME_APPLICATION_TYPES } from '@/constants/GAME_APPLICATION_TYPES'
import { type ApplicationType } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'

// Types
type Props = Readonly<{
	orgUri: string
	role: 'developer' | 'publisher'
	emptyMessage: string
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

export function OrgCreditsFeed(props: Props) {
	const { orgUri, role, emptyMessage } = props

	const [games, setGames] = useState<GameFeedGame[]>([])
	const [cursor, setCursor] = useState<string | undefined>(undefined)
	const [isLoading, setIsLoading] = useState(true)
	const sentinelRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		setGames([])
		setCursor(undefined)
		setIsLoading(true)

		const fetch = role === 'developer'
			? API.getOrgDevelopedFeed(orgUri, { limit: 50 })
			: API.getOrgPublishedFeed(orgUri, { limit: 50 })

		fetch
			.then((result) => {
				setGames(result.feed.map((item) => item.game))
				setCursor(result.cursor)
				setIsLoading(false)
			})
			.catch(() => {
				setIsLoading(false)
			})
	}, [orgUri, role])

	const loadMore = useCallback(() => {
		if (!cursor || isLoading) return
		setIsLoading(true)

		const fetch = role === 'developer'
			? API.getOrgDevelopedFeed(orgUri, { limit: 50, cursor })
			: API.getOrgPublishedFeed(orgUri, { limit: 50, cursor })

		fetch
			.then((result) => {
				setGames((prev) => [...prev, ...result.feed.map((item) => item.game)])
				setCursor(result.cursor)
				setIsLoading(false)
			})
			.catch(() => {
				setIsLoading(false)
			})
	}, [orgUri, role, cursor, isLoading])

	useEffect(() => {
		const el = sentinelRef.current
		if (!el || !cursor || isLoading) return

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) {
					loadMore()
				}
			},
			{ rootMargin: '600px' },
		)

		observer.observe(el)
		return () => observer.disconnect()
	}, [cursor, isLoading, loadMore])

	if (isLoading && games.length === 0) {
		return (
			<div className={'flex items-center justify-center py-12'}>
				<Loader2 className={'size-6 animate-spin text-muted-foreground'} />
			</div>
		)
	}

	if (games.length === 0) {
		return (
			<p className={'text-muted-foreground'}>
				{emptyMessage}
			</p>
		)
	}

	return (
		<>
			<div
				className={
					'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'
				}>
				{games.map((game) => {
					const year = getFirstReleaseYear(game)
					const href = game.slug ? `/game/${game.slug}` : '#'

					return (
						<Link
							key={game.uri}
							href={href}
							className={'block'}>
							<TiltCard>
								<BoxArt gameRecord={game} />
							</TiltCard>
							<div className={'mt-1.5 px-0.5'}>
								<div className={'truncate text-sm font-medium'}>
									{game.name}
								</div>
								<div
									className={
										'flex justify-between truncate text-xs text-muted-foreground'
									}>
									{year && <span>{year}</span>}
									{game.applicationType && (
										<span className={'ml-auto'}>
											{GAME_APPLICATION_TYPES[
												game.applicationType as ApplicationType
											]?.name ?? game.applicationType}
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
