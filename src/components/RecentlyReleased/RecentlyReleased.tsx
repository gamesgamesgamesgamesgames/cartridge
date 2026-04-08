'use client'

// Local imports
import { BoxArt } from '@/components/BoxArt/BoxArt'
import { Container } from '@/components/Container/Container'
import { Header } from '@/components/Header/Header'
import { TiltCard } from '@/components/TiltCard/TiltCard'
import { Scroller } from '@/components/ui/scroller'
import { type GameFeedGame } from '@/helpers/API'
import Link from 'next/link'

// Types
type Props = Readonly<{
	games: GameFeedGame[]
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
	const { games } = props

	if (games.length === 0) return null

	return (
		<section>
			<Container>
				<Header
					className={'mb-6'}
					level={3}>
					{'Recently Released'}
				</Header>

				<Scroller
					orientation={'horizontal'}
					hideScrollbar
					withNavigation
					scrollStep={176}
					className={'-mx-4 flex gap-4 px-4 py-4'}>
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
			</Container>
		</section>
	)
}
