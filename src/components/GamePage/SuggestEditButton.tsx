'use client'

// Module imports
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Link from 'next/link'
import { useStore } from 'statery'

// Local imports
import { Button } from '@/components/ui/button'
import { store } from '@/store/store'

// Types
type Props = Readonly<{ slug: string }>

export function SuggestEditButton(props: Props) {
	const { slug } = props
	const { user } = useStore(store)

	if (!user) {
		return null
	}

	return (
		<Button
			asChild
			size={'sm'}
			variant={'outline'}>
			<Link href={`/dashboard/contribute/${slug}`}>
				<FontAwesomeIcon icon={faPenToSquare} />
				{'Suggest Edit'}
			</Link>
		</Button>
	)
}
