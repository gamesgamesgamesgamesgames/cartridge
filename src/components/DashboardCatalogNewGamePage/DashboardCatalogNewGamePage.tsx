'use client'

// Local imports
import { Container } from '@/components/Container/Container'
import { DashboardCatalogNewGameContextProvider } from '@/context/DashboardCatalogNewGameContext/DashboardCatalogNewGameContext'
import { DashboardCatalogNewGamePageContent } from '@/components/DashboardCatalogNewGamePageContent/DashboardCatalogNewGamePageContent'
import { DashboardHeader } from '@/components/DashboardHeader/DashboardHeader'
import { DashboardCatalogNewGameFooter } from '../DashboardCatalogNewGameFooter/DashboardCatalogNewGameFooter'
import { DashboardCatalogNewGamePageStepper } from '../DashboardCatalogNewGamePageStepper/DashboardCatalogNewGamePageStepper'

// Constants
const BREADCRUMBS = [
	{
		label: 'My Catalog',
		url: '/dashboard/catalog',
	},
	{
		label: 'New Game',
		url: '/dashboard/catalog/new-game/general',
	},
]

export function DashboardCatalogNewGamePage() {
	return (
		<DashboardCatalogNewGameContextProvider>
			<DashboardHeader breadcrumbs={BREADCRUMBS} />

			<Container isScrollable={false}>
				<div className={'items-stretch flex gap-4 h-full overflow-hidden'}>
					<DashboardCatalogNewGamePageStepper />

					<div className={'flex flex-col grow justify-stretch w-full'}>
						<DashboardCatalogNewGamePageContent />

						<DashboardCatalogNewGameFooter />
					</div>
				</div>
			</Container>
		</DashboardCatalogNewGameContextProvider>
	)
}
