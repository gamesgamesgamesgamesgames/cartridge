// Local imports
import { CategorizationContent } from '@/components/DashboardCatalogEditGamePage/CategorizationContent'
import { GeneralContent } from '@/components/DashboardCatalogEditGamePage/GeneralContent'
import { MediaContent } from '@/components/DashboardCatalogEditGamePage/MediaContent'
import { ReleasesContent } from '@/components/DashboardCatalogEditGamePage/ReleasesContent'
import { ReviewContent } from '@/components/DashboardCatalogEditGamePage/ReviewContent'
import { type StepperStep } from '@/typedefs/StepperStep'

export const EDIT_GAME_STEPS: StepperStep[] = [
	{
		title: 'General',
		component: GeneralContent,
	},
	{
		title: 'Categorization',
		component: CategorizationContent,
	},
	{
		title: 'Media',
		component: MediaContent,
	},
	{
		title: 'Releases',
		component: ReleasesContent,
	},
	{
		title: 'Review',
		component: ReviewContent,
	},
]
