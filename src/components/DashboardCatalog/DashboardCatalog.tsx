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
import { faEdit, faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
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
				className={'hidden sm:flex'}
				size={'sm'}
				variant={'secondary'}>
				<Link href={`/dashboard/catalog/new-game`}>
					<FontAwesomeIcon icon={faPlus} />
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
				<div className={'flex h-full items-center justify-center'}>
					{'No games found.'}
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
								'duration-[0.1s] group hover:scale-[1.1] relative shadow-md hover:shadow-xl transition-all'
							}>
							<BoxArt
								key={parseATURI(game.record.uri).rkey}
								gameRecord={game.record}
							/>

							<div
								className={
									'absolute inset-0 opacity-0 group-hover:opacity-100 transition-[opacity]'
								}>
								<div className={'absolute flex gap-2 right-2 top-2'}>
									<Button
										asChild
										size={'icon'}>
										<Link href={`/dashboard/catalog/${did}/${rkey}`}>
											<FontAwesomeIcon icon={faEdit} />
										</Link>
									</Button>
								</div>

								<div
									className={'absolute align-end bottom-0 flex left-0 right-0'}>
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
	}, [gamesCatalog, state])

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
