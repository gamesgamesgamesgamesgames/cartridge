'use client'

// Local imports
import { BoxArt } from '@/components/BoxArt/BoxArt'
import { Container } from '@/components/Container/Container'
import { Header } from '@/components/Header/Header'
import { TiltCard } from '@/components/TiltCard/TiltCard'
import { Scroller } from '@/components/ui/scroller'
import { GAME_APPLICATION_TYPES } from '@/constants/GAME_APPLICATION_TYPES'
import { type GameFeedGame } from '@/helpers/API'
import { type ApplicationType } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'
import Link from 'next/link'

// Types
type Props = Readonly<{
	games: GameFeedGame[]
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

export function SimilarGames(props: Props) {
	const { games } = props

	return (
		<section className={'bg-secondary'}>
			<Container>
				<Header
					className={'mb-6'}
					level={3}>
					{'Similar Games'}
				</Header>

				<Scroller
					orientation={'horizontal'}
					hideScrollbar
					withNavigation
					scrollStep={176}
					className={'flex gap-4 pb-4'}>
					{games.map((game) => {
						const year = getFirstReleaseYear(game)
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
				</Scroller>
			</Container>
		</section>
	)
}
