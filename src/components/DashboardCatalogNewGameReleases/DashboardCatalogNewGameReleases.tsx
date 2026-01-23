'use client'

// Module imports
import { Flex } from '@radix-ui/themes'

// Local imports
import { DashboardCatalogNewGameFooter } from '@/components/DashboardCatalogNewGameFooter/DashboardCatalogNewGameFooter'
import { useDashboardCatalogNewGameContext } from '@/context/DashboardCatalogNewGameContext/DashboardCatalogNewGameContext'

export function DashboardCatalogNewGameReleases() {
	const { state } = useDashboardCatalogNewGameContext()

	const isDisabled = state === 'active'

	return (
		<>
			<Flex direction={'column'}>{'WIP'}</Flex>

			<DashboardCatalogNewGameFooter
				previous={'categorization'}
				next={'review'}
			/>
		</>
	)
}
