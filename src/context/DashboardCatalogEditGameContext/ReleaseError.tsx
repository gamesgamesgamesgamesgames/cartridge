// Local imports
import { Button } from '@/components/ui/button'
import { useDashboardCatalogEditGameContext } from '@/context/DashboardCatalogEditGameContext/DashboardCatalogEditGameContext'
import { useCallback } from 'react'

export function ReleaseError() {
	const { goToStepIndex } = useDashboardCatalogEditGameContext()

	const handleClick = useCallback(() => {
		goToStepIndex(3) // Releases step is at index 3
	}, [goToStepIndex])

	return (
		<>
			{'At least one '}
			<Button
				className={'h-auto p-0'}
				onClick={handleClick}
				variant={'link'}>
				{'release'}
			</Button>
			{' with a complete release date is required.'}
		</>
	)
}
