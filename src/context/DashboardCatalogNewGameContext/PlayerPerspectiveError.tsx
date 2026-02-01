// Local imports
import { Button } from '@/components/ui/button'
import { useDashboardCatalogNewGameContext } from '@/context/DashboardCatalogNewGameContext/DashboardCatalogNewGameContext'
import { useCallback } from 'react'

export function PlayerPerspectiveError() {
	const { goToStepIndex } = useDashboardCatalogNewGameContext()

	const handleClick = useCallback(() => {
		goToStepIndex(1)
		setTimeout(() => {
			const target = document.querySelector(
				'#game-playerPerspective',
			) as HTMLInputElement
			target.scrollIntoView({ behavior: 'smooth' })
		}, 100)
	}, [goToStepIndex])

	return (
		<>
			{'At least 1 '}
			<Button
				className={'h-auto p-0'}
				onClick={handleClick}
				variant={'link'}>
				{'Player Perspective'}
			</Button>
			{' is required.'}
		</>
	)
}
