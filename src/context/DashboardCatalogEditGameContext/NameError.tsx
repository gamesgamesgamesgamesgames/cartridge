// Local imports
import { Button } from '@/components/ui/button'
import { useDashboardCatalogEditGameContext } from '@/context/DashboardCatalogEditGameContext/DashboardCatalogEditGameContext'
import { useCallback } from 'react'

export function NameError() {
	const { goToStepIndex, steps } = useDashboardCatalogEditGameContext()

	const handleClick = useCallback(() => {
		goToStepIndex(0)
		setTimeout(() => {
			const target = document.querySelector('#game-name') as HTMLInputElement
			target.focus()
		}, 100)
	}, [goToStepIndex])

	return (
		<>
			<Button
				className={'h-auto p-0'}
				onClick={handleClick}
				variant={'link'}>
				{'Name'}
			</Button>
			{' is required.'}
		</>
	)
}
