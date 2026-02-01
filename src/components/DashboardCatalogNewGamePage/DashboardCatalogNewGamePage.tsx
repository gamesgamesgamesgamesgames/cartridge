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
const STEPS = [
	{
		title: 'General',
	},
	{
		title: 'Categorization',
	},
	{
		title: 'Releases',
	},
	{
		title: 'Review',
	},
]

export function DashboardCatalogNewGamePage() {
	return (
		<DashboardCatalogNewGameContextProvider steps={STEPS}>
			<DashboardHeader breadcrumbs={BREADCRUMBS} />

			<Container className={'p-4'}>
				<div className={'flex gap-4 h-full'}>
					<DashboardCatalogNewGamePageStepper />

					<div className={'flex flex-col h-full w-full'}>
						<DashboardCatalogNewGamePageContent />

						<DashboardCatalogNewGameFooter />
					</div>
				</div>
			</Container>
		</DashboardCatalogNewGameContextProvider>
	)
}
