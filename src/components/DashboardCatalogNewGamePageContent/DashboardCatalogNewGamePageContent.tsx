// Local imports
import { DashboardCatalogNewGameCategorization } from '@/components/DashboardCatalogNewGameCategorization/DashboardCatalogNewGameCategorization'
import { useDashboardCatalogNewGameContext } from '@/context/DashboardCatalogNewGameContext/DashboardCatalogNewGameContext'
import { DashboardCatalogNewGameGeneral } from '@/components/DashboardCatalogNewGameGeneral/DashboardCatalogNewGameGeneral'
import { DashboardCatalogNewGameReleases } from '@/components/DashboardCatalogNewGameReleases/DashboardCatalogNewGameReleases'
import { DashboardCatalogNewGameReview } from '@/components/DashboardCatalogNewGameReview/DashboardCatalogNewGameReview'
import { ScrollArea } from '../ui/scroll-area'

export function DashboardCatalogNewGamePageContent() {
	const { currentStepIndex } = useDashboardCatalogNewGameContext()

	return (
		<ScrollArea className={'flex-grow'}>
			{currentStepIndex === 0 && <DashboardCatalogNewGameGeneral />}
			{currentStepIndex === 1 && <DashboardCatalogNewGameCategorization />}
			{currentStepIndex === 2 && <DashboardCatalogNewGameReleases />}
			{currentStepIndex === 3 && <DashboardCatalogNewGameReview />}
		</ScrollArea>
	)
}
