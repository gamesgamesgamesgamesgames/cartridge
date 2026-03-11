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
import { getReturnUrl } from '@/helpers/oauth'
import { login } from '@/store/actions/login'
import { store } from '@/store/store'

export function CallbackPage() {
	const router = useRouter()

	useEffect(() => {
		if (window.location.search.includes('code=')) {
			login().then(() => {
				const { profileType } = store.state
				if (profileType) {
					router.replace(getReturnUrl() ?? '/')
				} else {
					router.replace('/profile-setup')
				}
			})
		}
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
					<EmptyTitle>{'Verifying authentication...'}</EmptyTitle>
				</EmptyHeader>
			</Empty>
		</div>
	)
}
