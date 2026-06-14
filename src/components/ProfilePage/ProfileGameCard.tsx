'use client'

// Module imports
import { Eye, Pencil } from 'lucide-react'
import Link from 'next/link'

// Local imports
import { BoxArt } from '@/components/BoxArt/BoxArt'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/Header/Header'
import { parseATURI } from '@/helpers/parseATURI'
import { type GameRecord } from '@/typedefs/GameRecord'

// Types
type Props = Readonly<{
	game: GameRecord
	isOwnProfile: boolean
}>

export function ProfileGameCard(props: Props) {
	const { game, isOwnProfile } = props
	const gameHref = `/game/${game.slug ?? game.uri}`

	if (!isOwnProfile) {
		return (
			<Link
				href={gameHref}
				className={'group flex flex-col gap-2'}>
				<BoxArt gameRecord={game} className={'rounded-md'} />
				<Header
					className={'line-clamp-2 text-sm transition-colors group-hover:text-primary'}
					level={4}>
					{game.name}
				</Header>
			</Link>
		)
	}

	const { did, rkey } = parseATURI(game.uri)

	return (
		<div className={'group relative flex flex-col gap-2'}>
			<div className={'relative overflow-hidden rounded-md'}>
				<BoxArt gameRecord={game} className={'rounded-md'} />

				<div
					className={
						'absolute inset-0 flex items-start justify-end gap-1.5 bg-black/0 p-2 transition-colors group-hover:bg-black/40 group-focus-within:bg-black/40'
					}>
					<Button
						asChild
						size={'icon-sm'}
						variant={'secondary'}
						className={'opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100'}
						aria-label={`View ${game.name}`}>
						<Link href={gameHref}>
							<Eye className={'size-3.5'} />
						</Link>
					</Button>

					<Button
						asChild
						size={'icon-sm'}
						variant={'secondary'}
						className={'opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100'}
						aria-label={`Edit ${game.name}`}>
						<Link href={`/dashboard/catalog/${did}/${rkey}`}>
							<Pencil className={'size-3.5'} />
						</Link>
					</Button>
				</div>
			</div>

			<Header
				className={'line-clamp-2 text-sm'}
				level={4}>
				{game.name}
			</Header>
		</div>
	)
}
