'use client'

// Module imports
import Link from 'next/link'
import { useStore } from 'statery'
import { faPen } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

// Local imports
import { Button } from '@/components/ui/button'
import { store } from '@/store/store'

// Types
type Props = Readonly<{
	profileDid: string
}>

export function EditProfileButton(props: Props) {
	const { profileDid } = props
	const { user } = useStore(store)

	if (!user?.did || user.did !== profileDid) return null

	return (
		<Button
			asChild
			variant={'outline'}
			size={'sm'}>
			<Link href={'/settings/profile'}>
				<FontAwesomeIcon icon={faPen} />
				{'Edit Profile'}
			</Link>
		</Button>
	)
}
