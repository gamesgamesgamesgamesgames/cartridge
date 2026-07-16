// Module imports
import { Save, TriangleAlert, Upload } from 'lucide-react'
import { toast } from 'sonner'

// Local imports
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useDashboardCatalogEditGameContext } from '@/context/DashboardCatalogEditGameContext/DashboardCatalogEditGameContext'
import { useCallback, useEffect, useMemo, useState } from 'react'

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
		uploadProgress,
		uploadTotal,
	} = useDashboardCatalogEditGameContext()

	const isDisabled = state === 'active'

	useEffect(() => {
		if (state === 'idle') {
			setIsPublishing(false)
			setIsSaving(false)
		}
	}, [state])

	const handleNextClick = useCallback(() => nextStep(), [nextStep])
	const handlePreviousClick = useCallback(() => previousStep(), [previousStep])

	const handlePublishClick = useCallback(() => {
		if (publishErrors.length) {
			toast.error('Cannot publish game', {
				description: 'Please fix all errors before publishing.',
			})
			return
		}

		if (!isPublishing) {
			setIsPublishing(true)
			publishGame()
		}
	}, [isPublishing, publishErrors, publishGame])

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
			<Button
				color={'green'}
				disabled={Boolean(publishErrors.length) || isDisabled}
				onClick={handlePublishClick}>
				{isPublishing && <Spinner data-icon={'inline-start'} />}
				{!isPublishing && <Upload className={'size-4'} />}
				{'Publish'}
			</Button>
		)
	}, [handleNextClick, handlePublishClick, isDisabled, publishErrors])

	const handleSaveClick = useCallback(() => {
		if (saveErrors.length) {
			toast.error('Cannot save draft', {
				description: 'Please fix all errors before saving.',
			})
			return
		}

		if (!isSaving) {
			setIsSaving(true)
			saveGameDraft()
		}
	}, [isSaving, saveErrors, saveGameDraft])

	const saveButton = useMemo(
		() => (
			<Button
				disabled={Boolean(saveErrors.length) || isDisabled}
				onClick={handleSaveClick}
				variant={'outline'}>
				{isSaving && <Spinner data-icon={'inline-start'} />}
				{!isSaving && <Save className={'size-4'} />}
				{'Save Draft'}
			</Button>
		),
		[handleSaveClick, isDisabled, isSaving, saveErrors],
	)

	return (
		<>
			<div className={'items-center gap-2 grid grid-cols-2 mt-4 sm:gap-4 sm:grid-cols-3'}>
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

				<div className={'hidden justify-center text-muted-foreground text-sm sm:flex'}>
					<span>{`Step ${currentStepIndex + 1} of ${steps.length}`}</span>
				</div>

				<div className={'items-center flex gap-4 justify-end'}>
					{saveButton}

					{nextButton}
				</div>
			</div>

			{uploadProgress !== null && uploadTotal !== null && uploadTotal > 0 && (
				<div className={'mt-2 flex flex-col gap-1'}>
					<div className={'flex justify-between text-xs text-muted-foreground'}>
						<span>{'Uploading media...'}</span>
						<span>{`${Math.round((uploadProgress / uploadTotal) * 100)}%`}</span>
					</div>
					<div className={'h-1.5 w-full overflow-hidden rounded-full bg-muted'}>
						<div
							className={'h-full rounded-full bg-primary transition-all duration-300'}
							style={{ width: `${(uploadProgress / uploadTotal) * 100}%` }}
						/>
					</div>
				</div>
			)}

			{publishErrors.length > 0 && (
				<div className={'mt-2 flex flex-col gap-1'}>
					{publishErrors.map((error, index) => (
						<div key={index} className={'flex items-center gap-2 text-sm text-destructive'}>
							<TriangleAlert className={'size-3.5 shrink-0'} />
							{error}
						</div>
					))}
				</div>
			)}
		</>
	)
}
