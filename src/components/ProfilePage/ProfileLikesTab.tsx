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

// Types
type Props = Readonly<{
	profileDid: string
}>

export function ProfileLikesTab(props: Props) {
	const { profileDid } = props

	const [games, setGames] = useState<GameFeedGame[]>([])
	const [cursor, setCursor] = useState<string | undefined>(undefined)
	const [isLoading, setIsLoading] = useState(true)
	const sentinelRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		API.getLikedGames(profileDid, 50).then((result) => {
			setGames(result.feed.map((item) => item.game))
			setCursor(result.cursor)
			setIsLoading(false)
		}).catch(() => {
			setIsLoading(false)
		})
	}, [profileDid])

	const loadMore = useCallback(() => {
		if (!cursor || isLoading) return
		setIsLoading(true)
		API.getLikedGames(profileDid, 50, cursor).then((result) => {
			setGames((prev) => [...prev, ...result.feed.map((item) => item.game)])
			setCursor(result.cursor)
			setIsLoading(false)
		}).catch(() => {
			setIsLoading(false)
		})
	}, [profileDid, cursor, isLoading])

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
				{'No liked games yet.'}
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
