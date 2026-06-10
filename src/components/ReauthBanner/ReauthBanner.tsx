'use client'

// Module imports
import { RefreshCw } from 'lucide-react'
import { useCallback } from 'react'
import { useStore } from 'statery'

// Local imports
import { Button } from '@/components/ui/button'
import { Container } from '@/components/Container/Container'
import { getClient, loginWithRedirect } from '@/helpers/oauth'
import { store } from '@/store/store'

export function ReauthBanner() {
	const { needsReauth, user } = useStore(store)

	const handleReauth = useCallback(async () => {
		if (!user?.handle) return

		const returnTo = window.location.pathname + window.location.search
		await loginWithRedirect(user.handle, returnTo)
	}, [user?.handle])

	if (!needsReauth || !user?.handle) return null

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
