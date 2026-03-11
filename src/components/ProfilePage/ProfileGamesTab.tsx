// Local imports
import { BoxArt } from '@/components/BoxArt/BoxArt'
import { Header } from '@/components/Header/Header'
import { type GameRecord } from '@/typedefs/GameRecord'
import Link from 'next/link'

// Types
type Props = Readonly<{
	games: GameRecord[]
}>

export function ProfileGamesTab(props: Props) {
	const { games } = props

	if (!games.length) {
		return (
			<p className={'text-muted-foreground'}>
				{'This user hasn\'t created any games yet.'}
			</p>
		)
	}

	return (
		<div className={'grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4'}>
			{games.map((game) => (
				<Link
					key={game.uri}
					href={`/game/${game.slug ?? game.uri}`}
					className={'group flex flex-col gap-2'}>
					<BoxArt gameRecord={game} />
					<Header
						className={'text-sm group-hover:text-primary transition-colors'}
						level={4}>
						{game.name}
					</Header>
				</Link>
			))}
		</div>
	)
}
