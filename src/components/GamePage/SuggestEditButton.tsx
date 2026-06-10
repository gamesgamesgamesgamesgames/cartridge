'use client'

// Module imports
import { SquarePen } from 'lucide-react'
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
			size={'default'}
			variant={'outline'}
			className={'hover:border-primary/50 hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/10 dark:hover:border-primary/50'}>
			<Link href={`/dashboard/contribute/${slug}`}>
				<SquarePen />
				{'Suggest Edit'}
			</Link>
		</Button>
	)
}
