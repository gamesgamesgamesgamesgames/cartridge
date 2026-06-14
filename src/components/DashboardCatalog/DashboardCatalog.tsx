'use client'

// Module imports
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useStore } from 'statery'

// Local imports
import { BoxArt } from '@/components/BoxArt/BoxArt'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/Container/Container'
import { DashboardHeader } from '@/components/DashboardHeader/DashboardHeader'
import { Eye, Pencil, Plus } from 'lucide-react'
import { listGames } from '@/store/actions/listGames'
import { parseATURI } from '@/helpers/parseATURI'
import { type State } from '@/typedefs/State'
import { store } from '@/store/store'

// Constants
const NULL_GAMES = Array(20).fill(null)

export function DashboardCatalog() {
	const { gamesCatalog, gamesCatalogHasNextPage, user } = useStore(store)

	const [state, setState] = useState<State>('idle')

	const loadGames = useCallback(() => {
		setState('active')
		listGames().then(() => setState('idle'))
	}, [])

	const breadcrumbs = useMemo(
		() => [
			{
				label: 'My Catalog',
				url: '/dashboard/catalog',
			},
		],
		[],
	)

	const controls = useMemo(
		() => (
			<Button
				asChild
				className={'flex'}
				size={'sm'}
				variant={'secondary'}>
				<Link href={`/dashboard/catalog/new-game`}>
					<Plus className={'size-4'} />
					{'Add Game'}
				</Link>
			</Button>
		),
		[],
	)

	const gamesElements = useMemo(() => {
		if (gamesCatalog === null) {
			return (
				<div
					className={
						'auto-rows-min gap-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 grid-flow-row'
					}>
					{NULL_GAMES.map((_, index) => (
						<BoxArt key={index} />
					))}
				</div>
			)
		}

		if (!gamesCatalog.length) {
			return (
				<div className={'flex h-full flex-col items-center justify-center gap-4 py-20 text-center'}>
					<p className={'text-muted-foreground'}>
						{'No games in your catalog yet.'}
					</p>
					<Button asChild>
						<Link href={'/dashboard/catalog/new-game'}>
							<Plus className={'size-4'} />
							{'Add your first game'}
						</Link>
					</Button>
				</div>
			)
		}

		return (
			<div
				className={
					'auto-rows-min gap-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 grid-flow-row'
				}>
				{gamesCatalog.map((game) => {
					const { did, rkey } = parseATURI(game.record.uri)

					return (
						<div
							key={rkey}
							className={
								'group relative shadow-md transition-shadow duration-200 hover:shadow-xl focus-within:shadow-xl'
							}>
							<BoxArt
								key={parseATURI(game.record.uri).rkey}
								gameRecord={game.record}
							/>

							<div
								className={
									'absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100'
								}>
								<div className={'absolute right-2 top-2 flex gap-2'}>
									<Button
										asChild
										size={'icon'}
										aria-label={`View ${game.record.name}`}>
										<Link href={`/game/${game.record.slug}`}>
											<Eye className={'size-4'} />
										</Link>
									</Button>

									<Button
										asChild
										size={'icon'}
										aria-label={`Edit ${game.record.name}`}>
										<Link href={`/dashboard/catalog/${did}/${rkey}`}>
											<Pencil className={'size-4'} />
										</Link>
									</Button>
								</div>

								<div
									className={'absolute inset-x-0 bottom-0 flex items-end'}>
									<div
										className={
											'absolute inset-0 bg-linear-to-b from-transparent opacity-70 to-background'
										}
									/>
									<div className={'relative p-2'}>{game.record.name}</div>
								</div>
							</div>
						</div>
					)
				})}
			</div>
		)
	}, [gamesCatalog])

	useEffect(() => {
		if (gamesCatalog === null && state === 'idle') {
			loadGames()
		}
	}, [gamesCatalog, loadGames, state])

	return (
		<>
			<DashboardHeader
				breadcrumbs={breadcrumbs}
				controls={controls}
			/>

			<Container>
				{gamesElements}

				{state !== 'active' && gamesCatalogHasNextPage && (
					<Button
						className={'w-full'}
						onClick={loadGames}
						variant={'outline'}>
						{'Load more'}
					</Button>
				)}
			</Container>
		</>
	)
}
