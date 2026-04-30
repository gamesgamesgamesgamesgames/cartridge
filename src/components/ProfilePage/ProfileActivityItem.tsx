'use client'

// Module imports
import Link from 'next/link'
import { useState } from 'react'

// Local imports
import { BoxArt } from '@/components/BoxArt/BoxArt'
import { type ActivityFeedItem } from '@/helpers/API'

// Types
type Props = Readonly<{
	item: ActivityFeedItem
}>

function formatRelativeTime(dateString: string): string {
	const now = Date.now()
	const then = new Date(dateString).getTime()
	const diffSeconds = Math.floor((now - then) / 1000)

	if (diffSeconds < 60) return 'just now'
	const diffMinutes = Math.floor(diffSeconds / 60)
	if (diffMinutes < 60) return `${diffMinutes}m ago`
	const diffHours = Math.floor(diffMinutes / 60)
	if (diffHours < 24) return `${diffHours}h ago`
	const diffDays = Math.floor(diffHours / 24)
	if (diffDays < 30) return `${diffDays}d ago`
	return new Date(dateString).toLocaleDateString()
}

function StarRating(props: { rating: number }) {
	const stars = props.rating / 2
	const fullStars = Math.floor(stars)
	const hasHalf = stars - fullStars >= 0.5

	return (
		<span className={'flex items-center gap-0.5 text-sm'}>
			{Array.from({ length: 5 }, (_, i) => {
				if (i < fullStars) return <span key={i}>{'★'}</span>
				if (i === fullStars && hasHalf) return <span key={i}>{'★'}</span>
				return (
					<span key={i} className={'opacity-30'}>
						{'★'}
					</span>
				)
			})}
			<span className={'ml-1 text-xs text-muted-foreground'}>
				{props.rating}/10
			</span>
		</span>
	)
}

function LikeItem(props: Props) {
	const { item } = props
	const href = item.game.slug ? `/game/${item.game.slug}` : '#'

	return (
		<div className={'flex items-center gap-3 py-3'}>
			<Link href={href} className={'shrink-0'}>
				<BoxArt
					className={'w-10 rounded-sm'}
					gameRecord={item.game}
				/>
			</Link>

			<div className={'flex min-w-0 flex-1 items-center justify-between gap-2'}>
				<p className={'truncate text-sm'}>
					{'Liked '}
					<Link href={href} className={'font-semibold text-foreground hover:text-primary'}>
						{item.game.name}
					</Link>
				</p>

				<time className={'shrink-0 text-xs text-muted-foreground'}>
					{formatRelativeTime(item.createdAt)}
				</time>
			</div>
		</div>
	)
}

function ReviewItem(props: Props) {
	const { item } = props
	const [expanded, setExpanded] = useState(false)
	const href = item.game.slug ? `/game/${item.game.slug}` : '#'
	const review = item.review

	const previewLength = 200
	const text = review?.text ?? ''
	const needsTruncation = text.length > previewLength
	const displayText = expanded || !needsTruncation
		? text
		: text.slice(0, previewLength) + '…'

	return (
		<div className={'flex gap-3 py-3'}>
			<Link href={href} className={'shrink-0'}>
				<BoxArt
					className={'w-10 rounded-sm'}
					gameRecord={item.game}
				/>
			</Link>

			<div className={'flex min-w-0 flex-1 flex-col gap-1.5'}>
				<div className={'flex items-center justify-between gap-2'}>
					<p className={'truncate text-sm'}>
						{'Reviewed '}
						<Link href={href} className={'font-semibold text-foreground hover:text-primary'}>
							{item.game.name}
						</Link>
					</p>

					<time className={'shrink-0 text-xs text-muted-foreground'}>
						{formatRelativeTime(item.createdAt)}
					</time>
				</div>

				{review && <StarRating rating={review.rating} />}

				{review?.title && (
					<p className={'text-sm font-medium'}>{review.title}</p>
				)}

				{text && (
					<div className={'text-sm leading-relaxed text-muted-foreground'}>
						<p>{displayText}</p>
						{needsTruncation && (
							<button
								type={'button'}
								className={'mt-1 text-xs text-primary hover:underline'}
								onClick={() => setExpanded(!expanded)}>
								{expanded ? 'Show less' : 'Read more'}
							</button>
						)}
					</div>
				)}
			</div>
		</div>
	)
}

export function ProfileActivityItem(props: Props) {
	const { item } = props

	if (item.type === 'review') {
		return <ReviewItem item={item} />
	}

	return <LikeItem item={item} />
}
