// Local imports
import { Button } from '@/components/ui/button'
import { useDashboardCatalogNewGameContext } from '@/context/DashboardCatalogNewGameContext/DashboardCatalogNewGameContext'
import { useCallback } from 'react'

export function SummaryError() {
	const { goToStepIndex } = useDashboardCatalogNewGameContext()

	const handleClick = useCallback(() => {
		goToStepIndex(0)
		setTimeout(() => {
			const target = document.querySelector('#game-summary') as HTMLInputElement
			target.focus()
		}, 100)
	}, [goToStepIndex])

	return (
		<>
			<Button
				className={'h-auto p-0'}
				onClick={handleClick}
				variant={'link'}>
				{'Summary'}
			</Button>
			{' is required.'}
		</>
	)
}

// publishErrors: [
// 	name ? null : 'Name is required.',
// 	summary ? null : 'Summary is required.',
// 	genres!.size ? null : 'At least 1 Genre is required.',
// 	modes!.size ? null : 'At least 1 Mode is required.',
// 	playerPerspectives!.size
// 		? null
// 		: 'At least 1 Player Perspective is required.',
// ].filter(Boolean) as string[],
// saveErrors: [name ? null : 'Name is required.'].filter(
// 	Boolean,
// ) as string[],
