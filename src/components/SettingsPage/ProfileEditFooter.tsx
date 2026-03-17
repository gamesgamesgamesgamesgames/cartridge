'use client'

// Module imports
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

// Local imports
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useProfileEditContext } from '@/context/ProfileEditContext/ProfileEditContext'

export function ProfileEditFooter() {
	const { cancel, error, isDirty, state, submitProfile } = useProfileEditContext()

	const isSubmitting = state === 'active'
	const isDisabled = isSubmitting || !isDirty

	return (
		<div className={'flex flex-col gap-2'}>
			{error && (
				<p className={'text-sm text-destructive'}>{error}</p>
			)}

			<div className={'flex gap-3 justify-end'}>
				<Button
					variant={'outline'}
					disabled={!isDirty}
					onClick={cancel}>
					{'Cancel'}
				</Button>

				<Button
					disabled={isDisabled}
					onClick={submitProfile}>
					{isSubmitting && <Spinner data-icon={'inline-start'} />}
					{!isSubmitting && <FontAwesomeIcon icon={faCheck} />}
					{'Save Changes'}
				</Button>
			</div>
		</div>
	)
}
