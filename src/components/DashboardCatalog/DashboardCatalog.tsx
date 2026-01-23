'use client'

// Module imports
import { Box, Button, Flex, Grid, Heading, Separator } from '@radix-ui/themes'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useStore } from 'statery'

// Local imports
import { BoxArt } from '@/components/BoxArt/BoxArt'
import { Link } from '@/components/Link/Link'
import { listGames } from '@/store/actions/listGames'
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

	const gamesElements = useMemo(() => {
		if (gamesCatalog === null) {
			return (
				<Grid
					columns={'5'}
					gap={'6'}>
					{NULL_GAMES.map((_, index) => (
						<BoxArt key={index} />
					))}
				</Grid>
			)
		}

		if (!gamesCatalog.length) {
			return (
				<Flex
					align={'center'}
					height={'100%'}
					justify={'center'}>
					{'No games found.'}
				</Flex>
			)
		}

		return (
			<Grid
				columns={'5'}
				gap={'6'}>
				{gamesCatalog.map((game, index) => (
					<BoxArt
						key={index}
						game={game}
					/>
				))}
			</Grid>
		)
	}, [gamesCatalog, state])

	useEffect(() => {
		if (gamesCatalog === null && state === 'idle') {
			loadGames()
		}
	}, [gamesCatalog, loadGames, state])

	return (
		<>
			<Flex justify={'between'}>
				<Heading as={'h2'}>{'Games'}</Heading>

				{Boolean(user?.did) && (
					<Link
						asChild
						href={`/dashboard/catalog/new-game/general`}>
						<Button>{'Add Game'}</Button>
					</Link>
				)}
			</Flex>

			<Box py={'4'}>
				<Separator size={'4'} />
			</Box>

			{gamesElements}

			<Flex
				align={'stretch'}
				width={'100%'}>
				{state !== 'active' && gamesCatalogHasNextPage && (
					<Box
						asChild
						flexGrow={'1'}
						mt={'4'}>
						<Button
							onClick={loadGames}
							variant={'outline'}>
							{'Load more'}
						</Button>
					</Box>
				)}
			</Flex>
		</>
	)
}
