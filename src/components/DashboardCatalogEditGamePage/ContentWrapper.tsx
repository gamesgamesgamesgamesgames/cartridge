// Module imports
import { useMemo } from 'react'

// Local imports
import { useDashboardCatalogEditGameContext } from '@/context/DashboardCatalogEditGameContext/DashboardCatalogEditGameContext'

export function ContentWrapper() {
	const { currentStepIndex, steps } = useDashboardCatalogEditGameContext()

	const contentElements = useMemo(
		() =>
			steps.map((step, index) => {
				if (currentStepIndex !== index) {
					return null
				}

				return <step.component key={JSON.stringify(step)} />
			}),
		[currentStepIndex],
	)
	return contentElements
}
