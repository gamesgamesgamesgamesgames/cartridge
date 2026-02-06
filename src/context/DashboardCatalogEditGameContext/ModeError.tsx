// Local imports
import { Button } from '@/components/ui/button'
import { useDashboardCatalogEditGameContext } from '@/context/DashboardCatalogEditGameContext/DashboardCatalogEditGameContext'
import { useCallback } from 'react'

export function ModeError() {
	const { goToStepIndex } = useDashboardCatalogEditGameContext()

	const handleClick = useCallback(() => {
		goToStepIndex(1)
		setTimeout(() => {
			const target = document.querySelector('#game-mode') as HTMLInputElement
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
				{'Mode'}
			</Button>
			{' is required.'}
		</>
	)
}

// publishErrors: [
// 	playerPerspectives!.size
// 		? null
// 		: 'At least 1 Player Perspective is required.',
// ].filter(Boolean) as string[],
// saveErrors: [name ? null : 'Name is required.'].filter(
// 	Boolean,
// ) as string[],
