// Module imports
import Link from 'next/link'

// Local imports
import { BoxArt } from '@/components/BoxArt/BoxArt'
import { SectionHeader } from './SectionHeader'

// Types
import type { CollectionSummaryView } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'
import type { GameFeedGame } from '@/helpers/API'

type CollectionWithGames = {
	collection: CollectionSummaryView
	games: GameFeedGame[]
}

type Props = Readonly<{
	collections: CollectionWithGames[]
}>

export function CollectionsTab(props: Props) {
	const { collections } = props

	return (
		<div className={'space-y-8'}>
			{collections.map(({ collection, games }) => (
				<SectionHeader
					key={collection.uri}
					id={`collection-${collection.slug ?? collection.uri}`}
					title={collection.name}>
					<div className={'grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'}>
						{games.map((game) => (
							<Link
								key={game.uri}
								className={'group transition-transform duration-200 hover:scale-105'}
								href={`/game/${game.slug}`}>
								<BoxArt
									className={'mb-2'}
									gameRecord={game} />
								<p className={'line-clamp-2 text-sm font-medium'}>
									{game.name}
								</p>
							</Link>
						))}
					</div>
				</SectionHeader>
			))}
		</div>
	)
}
