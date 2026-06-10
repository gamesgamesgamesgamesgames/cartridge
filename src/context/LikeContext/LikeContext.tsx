'use client'

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
	type PropsWithChildren,
} from 'react'
import { toast } from 'sonner'

import * as API from '@/helpers/API'
import { consumePendingLike, isAuthenticated, setPendingLike } from '@/helpers/oauth'

type LikeState = {
	count: number
	liked: boolean
	pending: boolean
	toggle: () => void
}

const LikeContext = createContext<LikeState | null>(null)

type Props = Readonly<PropsWithChildren<{
	gameUri: string
	gameName: string
	initialCount: number
	initialLiked: boolean
}>>

export function LikeProvider(props: Props) {
	const { children, gameUri, gameName, initialCount, initialLiked } = props

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
			toast.error('Couldn\'t update like. Try again.')
		} finally {
			setPending(false)
		}
	}, [gameUri, liked, count, pending])

	const toggle = useCallback(() => {
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

		API.getLikes(gameUri).then(({ count: freshCount, liked: freshLiked }) => {
			setLiked(freshLiked)
			setCount(freshCount)

			const pendingUri = consumePendingLike()
			if (pendingUri === gameUri && !freshLiked) {
				toggleLike()
				toast.success(`${gameName} added to your likes!`)
			}
		})
	}, []) // eslint-disable-line react-hooks/exhaustive-deps

	const value = useMemo(() => ({
		count,
		liked,
		pending,
		toggle,
	}), [count, liked, pending, toggle])

	return (
		<LikeContext value={value}>
			{children}
		</LikeContext>
	)
}

export function useLike() {
	const context = useContext(LikeContext)
	if (!context) {
		throw new Error('useLike must be used within a LikeProvider')
	}
	return context
}
