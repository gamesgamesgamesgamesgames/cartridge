'use client'

import Link from 'next/link'

import { BoxArt } from '@/components/BoxArt/BoxArt'
import { Container } from '@/components/Container/Container'
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
			<Container>
				<Header level={3}>{'Popular Right Now'}</Header>
				<Scroller
					orientation={'horizontal'}
					hideScrollbar
					withNavigation
					scrollStep={176}>
					<div className={'-mx-4 flex gap-4 px-4 py-4'}>
						{games.map((game) => (
							<Link
								key={game.uri}
								href={`/game/${game.slug}`}
								className={'group w-40 shrink-0'}>
								<TiltCard>
									<div className={'relative'}>
										<BoxArt gameRecord={game} />
										<span
											className={
												'absolute left-1.5 top-1.5 rounded bg-amber-500/90 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white'
											}>
											{'Trending'}
										</span>
									</div>
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
					</div>
				</Scroller>
			</Container>
		</section>
	)
}
