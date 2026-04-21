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
import { loginFromCallback } from '@/store/actions/login'
import { store } from '@/store/store'

export function OAuthCallbackPage() {
	const router = useRouter()

	useEffect(() => {
		loginFromCallback()
			.then(() => {
				const { profileType } = store.state
				if (profileType) {
					router.replace(getReturnUrl() ?? '/')
				} else {
					router.replace('/profile-setup')
				}
			})
			.catch((err) => {
				console.error('[OAuthCallback] login failed:', err)
				alert(`OAuth callback failed: ${err?.message ?? err}\n\nStack: ${err?.stack ?? 'no stack'}`)
				router.replace('/login')
			})
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
