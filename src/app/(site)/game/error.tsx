'use client'

import { startTransition } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'

// Shown when a game page couldn't load: game/[slug]/layout.tsx throws
// GameUnavailableError, usually because HappyView is rate-limiting this app for
// a moment. It lives one level above [slug] because a segment's own error.tsx
// can't catch errors from that segment's layout. A game that doesn't exist
// still gets the 404 page; this one offers a retry instead.
export default function GameError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
	const router = useRouter()
	// The failure happened in a server component, so retrying means fetching
	// the route again (refresh) as well as clearing the boundary (reset).
	const retry = () => startTransition(() => {
		router.refresh()
		reset()
	})

	return (
		<div className={'flex flex-col items-center gap-3 py-24 text-center'} role={'alert'}>
			<p className={'text-muted-foreground'}>{'This game couldn’t load right now.'}</p>
			<Button onClick={retry} variant={'outline'}>
				{'Try again'}
			</Button>
		</div>
	)
}
