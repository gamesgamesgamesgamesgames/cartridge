// Module imports
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useCallback, useState } from 'react'

// Local imports
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useProfileSetupContext } from '@/context/ProfileSetupContext/ProfileSetupContext'

export function Footer() {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const { state, submitProfile } = useProfileSetupContext()

	const isDisabled = state === 'active'

	const handleSubmitClick = useCallback(() => {
		if (!isSubmitting) {
			setIsSubmitting(true)
			submitProfile()
		}
	}, [isSubmitting, submitProfile])

	return (
		<div className={'flex justify-end mt-4'}>
			<Button
				disabled={isDisabled}
				onClick={handleSubmitClick}>
				{isSubmitting && <Spinner data-icon={'inline-start'} />}
				{!isSubmitting && <FontAwesomeIcon icon={faCheck} />}
				{'Save Profile'}
			</Button>
		</div>
	)
}
