// Module imports
import { CheckCircle2, Circle, CircleDot } from 'lucide-react'
import { useMemo } from 'react'

// Local imports
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemMedia,
	ItemTitle,
} from '@/components/ui/item'
import { useDashboardCatalogEditGameContext } from '@/context/DashboardCatalogEditGameContext/DashboardCatalogEditGameContext'

export function Stepper() {
	const { currentStepIndex, goToStepIndex, state, steps } =
		useDashboardCatalogEditGameContext()

	const stepElements = useMemo(() => {
		return steps.map((step, index) => (
			<Button
				key={index}
				asChild
				className={'cursor-pointer flex-nowrap'}
				disabled={state === 'active'}
				onClick={() => goToStepIndex(index)}
				variant={'ghost'}>
				<Item
					size={'sm'}
					variant={'default'}>
					<ItemMedia variant={'icon'}>
						{index > currentStepIndex && (
							<Circle className={'size-4 text-muted-foreground'} />
						)}

						{index === currentStepIndex && (
							<CircleDot className={'size-4'} />
						)}

						{index < currentStepIndex && (
							<CheckCircle2 className={'size-4'} />
						)}
					</ItemMedia>

					<ItemContent>
						<ItemTitle>{step.title}</ItemTitle>

						{step.description && (
							<ItemDescription>{step.description}</ItemDescription>
						)}
					</ItemContent>
				</Item>
			</Button>
		))
	}, [currentStepIndex, steps])

	return (
		<Card className={'h-min p-4 w-full md:w-min'}>
			<div className={'flex flex-row gap-1 overflow-x-auto md:flex-col md:gap-0'}>{stepElements}</div>
		</Card>
	)
}
