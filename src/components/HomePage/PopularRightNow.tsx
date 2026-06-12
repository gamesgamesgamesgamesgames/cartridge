'use client'

import Link from 'next/link'

import { BoxArt } from '@/components/BoxArt/BoxArt'
import { Header } from '@/components/Header/Header'
import { TiltCard } from '@/components/TiltCard/TiltCard'
import { Scroller } from '@/components/ui/scroller'

import type { GameFeedGame } from '@/helpers/API'

type Props = Readonly<{
	games: GameFeedGame[]
}>

export function PopularRightNow({ games }: Props) {
	if (games.length === 0) return null

	return (
		<section className={'py-12'}>
			<div className={'mb-2 flex items-baseline justify-between px-4 md:px-10 lg:px-16'}>
				<Header level={3}>{'Popular Right Now'}</Header>
				<Link
					href={'/browse'}
					className={'text-sm font-medium text-primary hover:underline'}>
					{'View all'}
				</Link>
			</div>

			<Scroller
				orientation={'horizontal'}
				hideScrollbar
				withNavigation
				scrollStep={176}
				className={'flex gap-4 px-4 py-4 md:px-10 lg:px-16'}>
				{games.map((game) => (
					<Link
						key={game.uri}
						href={`/game/${game.slug}`}
						className={'group w-40 shrink-0'}>
						<TiltCard>
							<BoxArt gameRecord={game} />
						</TiltCard>
						<div className={'mt-2'}>
							<p className={'truncate text-sm font-medium'}>{game.name}</p>
							{game.applicationType && (
								<p className={'truncate text-xs text-muted-foreground'}>
									{game.applicationType}
								</p>
							)}
						</div>
					</Link>
				))}
			</Scroller>
		</section>
	)
}
