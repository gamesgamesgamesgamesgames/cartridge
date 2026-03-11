'use client'

// Module imports
import { Heart } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

// Local imports
import * as API from '@/helpers/API'
import { consumePendingLike, isAuthenticated, setPendingLike } from '@/helpers/oauth'

// Types
type Props = Readonly<{
	className?: string
	gameUri: string
	initialCount: number
	initialLiked: boolean
}>

export function LikeButton(props: Props) {
	const { className, gameUri, initialCount, initialLiked } = props

	const [liked, setLiked] = useState(initialLiked)
	const [count, setCount] = useState(initialCount)
	const [pending, setPending] = useState(false)

	const toggleLike = useCallback(async () => {
		if (pending) return

		const wasLiked = liked
		const prevCount = count
		setLiked(!wasLiked)
		setCount(wasLiked ? prevCount - 1 : prevCount + 1)
		setPending(true)

		try {
			await API.toggleLike(gameUri)
		} catch {
			setLiked(wasLiked)
			setCount(prevCount)
		} finally {
			setPending(false)
		}
	}, [gameUri, liked, count, pending])

	const handleClick = useCallback(() => {
		if (!isAuthenticated()) {
			setPendingLike(gameUri)
			const returnTo = window.location.pathname + window.location.search
			window.location.href = `/login?returnTo=${encodeURIComponent(returnTo)}`
			return
		}

		toggleLike()
	}, [gameUri, toggleLike])

	useEffect(() => {
		if (!isAuthenticated()) return

		// Server can't check liked status (no auth token), so fetch it client-side
		API.getLikes(gameUri).then(({ count: freshCount, liked: freshLiked }) => {
			setLiked(freshLiked)
			setCount(freshCount)

			// Execute pending like after we know the real state
			const pendingUri = consumePendingLike()
			if (pendingUri === gameUri && !freshLiked) {
				toggleLike()
			}
		})
	}, []) // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<button
			type={'button'}
			onClick={handleClick}
			disabled={pending}
			className={`flex items-center gap-2 transition-colors hover:text-red-400${className ? ` ${className}` : ''}`}>
			<Heart
				className={`size-6 transition-colors ${liked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`}
			/>
			<span className={'text-sm font-medium tabular-nums'}>
				{count}
			</span>
		</button>
	)
}
