'use client'

// Module imports
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from 'statery'

// Local imports
import {
	Empty,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from '@/components/ui/empty'
import { Spinner } from '@/components/ui/spinner'
import { store } from '@/store/store'

export function CallbackPage() {
	const router = useRouter()

	const { quicksliceClient } = useStore(store)

	useEffect(() => {
		if (quicksliceClient && window.location.search.includes('code=')) {
			quicksliceClient
				.handleRedirectCallback()
				.then(() => router.replace('/dashboard'))
		}
	}, [quicksliceClient])

	return (
		<div
			className={
				'bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10'
			}>
			<Empty className={'w-full'}>
				<EmptyHeader>
					<EmptyMedia variant='icon'>
						<Spinner />
					</EmptyMedia>
					<EmptyTitle>{'Verifying authentication...'}</EmptyTitle>
				</EmptyHeader>
			</Empty>
		</div>
	)
}
