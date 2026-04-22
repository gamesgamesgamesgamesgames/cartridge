'use client'

// Module imports
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Local imports
import {
	Empty,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from '@/components/ui/empty'
import { Spinner } from '@/components/ui/spinner'
import { restoreSession } from '@/helpers/oauth'
import { logout } from '@/store/actions/logout'

export function LogoutPage() {
	const router = useRouter()

	useEffect(() => {
		restoreSession().then(() => logout()).then(() => router.replace('/'))
	}, [router])

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
