'use client'

// Module imports
import { Box, Button, Flex, Grid, Heading, Separator } from '@radix-ui/themes'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useStore } from 'statery'

// Local imports
import { BoxArt } from '@/components/BoxArt/BoxArt'
import { DashboardMainWrapper } from '@/components/DashboardMainWrapper/DashboardMainWrapper'
import { listGames } from '@/store/actions/listGames'
import { NewGameDialog } from '@/components/NewGameDialog/NewGameDialog'
import { store } from '@/store/store'

// Constants
const NULL_GAMES = Array(20).fill(null)

export function DashboardCatalog() {
	const { gamesCatalog, gamesCatalogHasNextPage } = useStore(store)

	const [state, setState] = useState<'idle' | 'active' | 'error'>('idle')

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
		<DashboardMainWrapper>
			<Flex justify={'between'}>
				<Heading as={'h2'}>{'Games'}</Heading>

				<NewGameDialog trigger={<Button>{'Add Game'}</Button>} />
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
		</DashboardMainWrapper>
	)
}
