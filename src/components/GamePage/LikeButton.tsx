'use client'

import { Heart, Loader2 } from 'lucide-react'
import { useCallback, useEffect, useRef } from 'react'

import { Button } from '@/components/ui/button'
import { useLike } from '@/context/LikeContext/LikeContext'

type Props = Readonly<{
	className?: string
	gameName: string
}>

function formatCount(n: number): string {
	if (n >= 10_000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`
	if (n >= 1_000) return n.toLocaleString()
	return String(n)
}

function likeLabel(count: number, liked: boolean): string {
	if (count === 0) return liked ? 'Liked' : 'Like'
	return `${formatCount(count)} ${count === 1 ? 'Like' : 'Likes'}`
}

const POP_CLASS = 'motion-safe:animate-[like-pop_400ms_cubic-bezier(0.34,1.56,0.64,1)]'
const DEFLATE_CLASS = 'motion-safe:animate-[like-deflate_250ms_ease-out]'

export function LikeButton(props: Props) {
	const { className, gameName } = props
	const { liked, count, pending, toggle } = useLike()

	const heartRef = useRef<SVGSVGElement>(null)
	const prevLiked = useRef(liked)
	const prevPending = useRef(pending)

	const clearAnim = useCallback(() => {
		heartRef.current?.classList.remove(POP_CLASS, DEFLATE_CLASS)
	}, [])

	useEffect(() => {
		const likedChanged = liked !== prevLiked.current
		const saveCompleted = prevPending.current && !pending

		prevLiked.current = liked
		prevPending.current = pending

		if ((likedChanged && !pending) || saveCompleted) {
			const el = heartRef.current
			if (!el) return
			el.classList.remove(POP_CLASS, DEFLATE_CLASS)
			el.classList.add(liked ? POP_CLASS : DEFLATE_CLASS)
			el.addEventListener('animationend', clearAnim, { once: true })
		}
	}, [liked, pending, clearAnim])

	return (
		<Button
			aria-label={liked ? `Unlike ${gameName}` : `Like ${gameName}`}
			aria-busy={pending || undefined}
			aria-pressed={liked}
			className={[
				className,
				liked
					? 'text-liked border-liked/25 hover:bg-liked/15 hover:border-liked/40 hover:text-liked dark:hover:bg-liked/15 dark:hover:border-liked/40'
					: 'hover:border-primary/50 hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/10 dark:hover:border-primary/50',
				pending && 'cursor-wait',
			].filter(Boolean).join(' ')}
			onClick={toggle}
			size={'default'}
			variant={'outline'}>
			{pending ? (
				<Loader2 className={'animate-spin'} aria-hidden={'true'} />
			) : (
				<Heart
					ref={heartRef}
					aria-hidden={'true'}
					className={`motion-safe:transition-colors ${liked ? 'fill-liked text-liked' : ''}`}
				/>
			)}
			{likeLabel(count, liked)}
		</Button>
	)
}
