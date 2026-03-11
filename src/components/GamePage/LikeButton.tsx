'use client'

// Module imports
import { Heart } from 'lucide-react'
import { useCallback, useState } from 'react'

// Local imports
import * as API from '@/helpers/API'
import { isAuthenticated, loginWithRedirect } from '@/helpers/oauth'

// Types
type Props = Readonly<{
	gameUri: string
	initialCount: number
	initialLiked: boolean
}>

export function LikeButton(props: Props) {
	const { gameUri, initialCount, initialLiked } = props

	const [liked, setLiked] = useState(initialLiked)
	const [count, setCount] = useState(initialCount)
	const [pending, setPending] = useState(false)

	const handleClick = useCallback(async () => {
		if (!isAuthenticated()) {
			loginWithRedirect()
			return
		}

		if (pending) return

		// Optimistic update
		const wasLiked = liked
		const prevCount = count
		setLiked(!wasLiked)
		setCount(wasLiked ? prevCount - 1 : prevCount + 1)
		setPending(true)

		try {
			await API.toggleLike(gameUri)
		} catch {
			// Revert on failure
			setLiked(wasLiked)
			setCount(prevCount)
		} finally {
			setPending(false)
		}
	}, [gameUri, liked, count, pending])

	return (
		<button
			type={'button'}
			onClick={handleClick}
			disabled={pending}
			className={'flex items-center gap-2 transition-colors hover:text-red-400'}>
			<Heart
				className={`size-6 transition-colors ${liked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`}
			/>
			<span className={'text-sm font-medium tabular-nums'}>
				{count}
			</span>
		</button>
	)
}
