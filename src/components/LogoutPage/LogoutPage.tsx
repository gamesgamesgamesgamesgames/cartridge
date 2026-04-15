'use client'

// Module imports
import { useEffect } from 'react'

// Local imports
import {
	Empty,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from '@/components/ui/empty'
import { Spinner } from '@/components/ui/spinner'
import { logout } from '@/store/actions/logout'

export function LogoutPage() {
	useEffect(() => {
		logout()
	}, [])

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
					<EmptyTitle>{'Logging out...'}</EmptyTitle>
				</EmptyHeader>
			</Empty>
		</div>
	)
}
