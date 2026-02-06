'use client'

// Module imports
import { useMemo } from 'react'

// Local imports
import { Container } from '@/components/Container/Container'
import {
	DashboardCatalogEditGameContextProvider,
	useDashboardCatalogEditGameContext,
} from '@/context/DashboardCatalogEditGameContext/DashboardCatalogEditGameContext'
import { ContentWrapper } from '@/components/DashboardCatalogEditGamePage/ContentWrapper'
import { DashboardHeader } from '@/components/DashboardHeader/DashboardHeader'
import { Footer } from '@/components/DashboardCatalogEditGamePage/Footer'
import { Stepper } from '@/components/DashboardCatalogEditGamePage/Stepper'

export function DashboardCatalogEditGamePage() {
	return (
		<DashboardCatalogEditGameContextProvider>
			<DashboardCatalogEditGamePageInner />
		</DashboardCatalogEditGameContextProvider>
	)
}

function DashboardCatalogEditGamePageInner() {
	const { isEditMode, name } = useDashboardCatalogEditGameContext()

	const breadcrumbs = useMemo(
		() => [
			{
				label: 'My Catalog',
				url: '/dashboard/catalog',
			},
			{
				label: isEditMode ? (name || 'Loading...') : 'New Game',
				url: '#',
			},
		],
		[isEditMode, name],
	)

	return (
		<>
			<DashboardHeader breadcrumbs={breadcrumbs} />

			<Container isScrollable={false}>
				<div className={'items-stretch flex gap-4 h-full overflow-hidden'}>
					<Stepper />

					<div className={'flex flex-col grow justify-stretch w-full'}>
						<ContentWrapper />

						<Footer />
					</div>
				</div>
			</Container>
		</>
	)
}
