// Module imports
import { Button, Flex } from '@radix-ui/themes'
import { faSave, faUpload } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

// Local imports
import { Link } from '@/components/Link/Link'
import { useDashboardCatalogNewGameContext } from '@/context/DashboardCatalogNewGameContext/DashboardCatalogNewGameContext'
import { useCallback, useState } from 'react'

type Props = Readonly<{
	next?: string
	previous?: string
}>

export function DashboardCatalogNewGameFooter(props: Props) {
	const { next, previous } = props

	const [isPublishing, setIsPublishing] = useState(false)
	const [isSaving, setIsSaving] = useState(false)

	const { isPublishable, isSaveable, publishGame, saveGameDraft, state } =
		useDashboardCatalogNewGameContext()

	const handlePublishClick = useCallback(() => {
		if (!isPublishable) {
			throw new Error('Cannot publish game')
		}

		if (!isPublishing) {
			setIsPublishing(true)
			publishGame()
		}
	}, [isPublishable, isPublishing])

	const handleSaveClick = useCallback(() => {
		if (!isSaveable) {
			throw new Error('Cannot publish game')
		}

		if (!isSaving) {
			setIsSaving(true)
			saveGameDraft()
		}
	}, [isSaveable, isSaving])

	const isDisabled = state === 'active'

	return (
		<Flex
			gap={'3'}
			justify={'between'}
			mt={'4'}>
			<Flex gap={'3'}>
				{Boolean(previous) && (
					<Link
						asChild
						href={`/dashboard/catalog/new-game/${previous}`}>
						<Button disabled={isDisabled}>{'Back'}</Button>
					</Link>
				)}
			</Flex>

			<Flex gap={'3'}>
				<Button
					disabled={!isSaveable || isDisabled}
					loading={isSaving}
					onClick={handleSaveClick}
					variant={'outline'}>
					<FontAwesomeIcon icon={faSave} />
					{'Save Draft'}
				</Button>

				{!next && (
					<Button
						color={'green'}
						disabled={!isPublishable || isDisabled}
						loading={isPublishing}
						onClick={handlePublishClick}>
						<FontAwesomeIcon icon={faUpload} />
						{'Publish'}
					</Button>
				)}

				{Boolean(next) && (
					<Link
						asChild
						href={`/dashboard/catalog/new-game/${next}`}>
						<Button disabled={isDisabled}>{'Continue'}</Button>
					</Link>
				)}
			</Flex>
		</Flex>
	)
}
