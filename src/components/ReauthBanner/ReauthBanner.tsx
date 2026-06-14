'use client'

// Module imports
import { PartyPopper, RefreshCw } from 'lucide-react'
import { useCallback } from 'react'
import { useStore } from 'statery'

// Local imports
import { Button } from '@/components/ui/button'
import { Container } from '@/components/Container/Container'
import { loginWithRedirect } from '@/helpers/oauth'
import { store } from '@/store/store'

export function ReauthBanner() {
	const { needsReauth, needsStudioReauth, user } = useStore(store)

	const handleReauth = useCallback(async () => {
		if (!user?.handle) return

		const returnTo = window.location.pathname + window.location.search
		await loginWithRedirect(user.handle, returnTo)
	}, [user?.handle])

	if (!user?.handle) return null

	if (needsStudioReauth) {
		return (
			<div className={'border-b border-primary/30 bg-primary/10'}>
				<Container isScrollable={false}>
					<div className={'flex items-center justify-between gap-4 py-2.5'}>
						<p className={'text-sm text-primary'}>
							<PartyPopper className={'mr-1.5 inline size-4'} />
							{'You\'re verified! Sign in again to unlock studio features like creating games and managing claims.'}
						</p>
						<Button
							variant={'outline'}
							size={'sm'}
							className={'shrink-0 border-primary/50 text-primary hover:bg-primary/20'}
							onClick={handleReauth}>
							<RefreshCw className={'size-3.5'} />
							{'Unlock studio'}
						</Button>
					</div>
				</Container>
			</div>
		)
	}

	if (!needsReauth) return null

	return (
		<div className={'border-b border-amber-500/30 bg-amber-500/10'}>
			<Container isScrollable={false}>
				<div className={'flex items-center justify-between gap-4 py-2.5'}>
					<p className={'text-sm text-amber-900 dark:text-amber-200'}>
						{'Cartridge has added new features that require updated permissions. Please sign in again to continue using all features.'}
					</p>
					<Button
						variant={'outline'}
						size={'sm'}
						className={'shrink-0 border-amber-500/50 text-amber-900 hover:bg-amber-500/20 dark:text-amber-200'}
						onClick={handleReauth}>
						<RefreshCw className={'size-3.5'} />
						{'Update permissions'}
					</Button>
				</div>
			</Container>
		</div>
	)
}
