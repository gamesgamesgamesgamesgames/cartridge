// Module imports
import {
	faSave,
	faTriangleExclamation,
	faUpload,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

// Local imports
import { Button } from '@/components/ui/button'
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from '@/components/ui/hover-card'
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemMedia,
} from '@/components/ui/item'
import { Spinner } from '@/components/ui/spinner'
import { useDashboardCatalogEditGameContext } from '@/context/DashboardCatalogEditGameContext/DashboardCatalogEditGameContext'
import { useCallback, useMemo, useState } from 'react'

export function Footer() {
	const [isPublishing, setIsPublishing] = useState(false)
	const [isSaving, setIsSaving] = useState(false)

	const {
		currentStepIndex,
		hasNext,
		hasPrevious,
		nextStep,
		previousStep,
		publishErrors,
		publishGame,
		saveErrors,
		saveGameDraft,
		state,
		steps,
	} = useDashboardCatalogEditGameContext()

	const isDisabled = state === 'active'

	const handleNextClick = useCallback(() => nextStep(), [nextStep])
	const handlePreviousClick = useCallback(() => previousStep(), [previousStep])

	const handlePublishClick = useCallback(() => {
		if (publishErrors.length) {
			throw new Error('Cannot publish game')
		}

		if (!isPublishing) {
			setIsPublishing(true)
			publishGame()
		}
	}, [isPublishing, publishErrors])

	const nextButton = useMemo(() => {
		if (hasNext) {
			return (
				<Button
					disabled={isDisabled}
					onClick={handleNextClick}>
					{'Next'}
				</Button>
			)
		}

		return (
			<HoverCard
				closeDelay={100}
				openDelay={10}>
				<HoverCardTrigger>
					<Button
						color={'green'}
						disabled={Boolean(publishErrors.length) || isDisabled}
						onClick={handlePublishClick}>
						{isPublishing && <Spinner data-icon={'inline-start'} />}
						{!isPublishing && <FontAwesomeIcon icon={faUpload} />}
						{'Publish'}
					</Button>
				</HoverCardTrigger>

				{Boolean(publishErrors.length) && (
					<HoverCardContent
						className={'flex flex-col gap-0.5 w-md'}
						side={'top'}>
						{publishErrors.map((error, index) => (
							<Item key={index}>
								<ItemMedia variant={'icon'}>
									<FontAwesomeIcon icon={faTriangleExclamation} />
								</ItemMedia>

								<ItemContent>
									<ItemDescription>{error}</ItemDescription>
								</ItemContent>
							</Item>
						))}
					</HoverCardContent>
				)}
			</HoverCard>
		)
	}, [handleNextClick, handlePublishClick, isDisabled, publishErrors])

	const handleSaveClick = useCallback(() => {
		if (saveErrors.length) {
			throw new Error('Cannot publish game')
		}

		if (!isSaving) {
			setIsSaving(true)
			saveGameDraft()
		}
	}, [isSaving, saveErrors])

	const saveButton = useMemo(
		() => (
			<HoverCard
				closeDelay={100}
				openDelay={10}>
				<HoverCardTrigger>
					<Button
						disabled={Boolean(saveErrors.length) || isDisabled}
						onClick={handleSaveClick}
						variant={'outline'}>
						{isSaving && <Spinner data-icon={'inline-start'} />}
						{!isSaving && <FontAwesomeIcon icon={faSave} />}
						{'Save Draft'}
					</Button>
				</HoverCardTrigger>

				{Boolean(saveErrors.length) && (
					<HoverCardContent
						className={'flex w-64 flex-col gap-0.5'}
						side={'top'}>
						{saveErrors.map((error, index) => (
							<Item key={index}>
								<ItemMedia variant={'icon'}>
									<FontAwesomeIcon icon={faTriangleExclamation} />
								</ItemMedia>

								<ItemContent>
									<ItemDescription>{error}</ItemDescription>
								</ItemContent>
							</Item>
						))}
					</HoverCardContent>
				)}
			</HoverCard>
		),
		[handleSaveClick, isDisabled, saveErrors],
	)

	return (
		<div className={'items-center gap-4 grid grid-cols-3 mt-4'}>
			<div className={'items-center flex gap-4'}>
				{hasPrevious && (
					<Button
						disabled={isDisabled}
						onClick={handlePreviousClick}
						variant={'outline'}>
						{'Back'}
					</Button>
				)}
			</div>

			<div className={'flex justify-center text-muted-foreground text-sm'}>
				<span>{`Step ${currentStepIndex + 1} of ${steps.length}`}</span>
			</div>

			<div className={'items-center flex gap-4 justify-end'}>
				{saveButton}

				{nextButton}
			</div>
		</div>
	)
}
