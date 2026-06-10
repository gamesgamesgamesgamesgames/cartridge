'use client'

import { List } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { BoxArt } from '@/components/BoxArt/BoxArt'
import { StarRating } from '@/components/ui/star-rating'
import { type ActivityFeedItem } from '@/helpers/API'

type Props = Readonly<{
	item: ActivityFeedItem
}>

function formatRelativeTime(dateString: string): string {
	const then = new Date(dateString).getTime()
	if (Number.isNaN(then)) return ''

	const diffSeconds = Math.floor((Date.now() - then) / 1000)
	if (diffSeconds < 0) return 'just now'
	if (diffSeconds < 60) return 'just now'
	const diffMinutes = Math.floor(diffSeconds / 60)
	if (diffMinutes < 60) return `${diffMinutes}m ago`
	const diffHours = Math.floor(diffMinutes / 60)
	if (diffHours < 24) return `${diffHours}h ago`
	const diffDays = Math.floor(diffHours / 24)
	if (diffDays < 30) return `${diffDays}d ago`
	return new Date(dateString).toLocaleDateString()
}

function gameHref(item: ActivityFeedItem): string {
	if (!item.game?.slug) return `/game/${encodeURIComponent(item.game?.uri ?? '')}`
	return `/game/${item.game.slug}`
}

function LikeItem(props: Props) {
	const { item } = props
	if (!item.game) return null

	return (
		<article className={'flex items-center gap-3 py-3'}>
			<Link href={gameHref(item)} className={'shrink-0'}>
				<BoxArt
					className={'w-10 rounded-sm'}
					gameRecord={item.game}
				/>
			</Link>

			<div className={'flex min-w-0 flex-1 items-center justify-between gap-2'}>
				<p className={'truncate text-sm'}>
					{'Liked '}
					<Link href={gameHref(item)} className={'font-semibold text-foreground hover:text-primary'}>
						{item.game.name}
					</Link>
				</p>

				<time
					className={'shrink-0 text-xs text-muted-foreground'}
					dateTime={item.createdAt}>
					{formatRelativeTime(item.createdAt)}
				</time>
			</div>
		</article>
	)
}

function ReviewItem(props: Props) {
	const { item } = props
	const [expanded, setExpanded] = useState(false)
	if (!item.game) return null

	const review = item.review
	const previewLength = 280
	const text = review?.text ?? ''
	const needsTruncation = text.length > previewLength
	const displayText = expanded || !needsTruncation
		? text
		: text.slice(0, previewLength) + '...'

	return (
		<article className={'rounded-lg bg-card/50 p-4 my-2'}>
			<div className={'flex gap-4'}>
				<Link href={gameHref(item)} className={'shrink-0'}>
					<BoxArt
						className={'w-16 rounded-md shadow-md'}
						gameRecord={item.game}
					/>
				</Link>

				<div className={'flex min-w-0 flex-1 flex-col gap-2'}>
					<div className={'flex items-start justify-between gap-2'}>
						<div>
							<p className={'text-sm font-medium'}>
								{'Reviewed '}
								<Link href={gameHref(item)} className={'text-foreground hover:text-primary'}>
									{item.game.name}
								</Link>
							</p>
							{review && <StarRating rating={review.rating} size={'md'} showNumeric />}
						</div>

						<time
							className={'shrink-0 text-xs text-muted-foreground'}
							dateTime={item.createdAt}>
							{formatRelativeTime(item.createdAt)}
						</time>
					</div>

					{review?.title && (
						<p className={'truncate text-sm font-semibold'}>{review.title}</p>
					)}

					{text && (
						<div className={'text-sm leading-relaxed text-muted-foreground'}>
							<p>{displayText}</p>
							{needsTruncation && (
								<button
									type={'button'}
									className={'mt-1.5 text-xs font-medium text-primary hover:underline'}
									aria-expanded={expanded}
									onClick={() => setExpanded(!expanded)}>
									{expanded ? 'Show less' : 'Read more'}
								</button>
							)}
						</div>
					)}
				</div>
			</div>
		</article>
	)
}

function ListCreateItem(props: Props) {
	const { item } = props

	return (
		<article className={'flex items-center gap-3 py-3'}>
			<div className={'flex size-10 shrink-0 items-center justify-center rounded-sm bg-muted'}>
				<List className={'size-5 text-muted-foreground'} aria-hidden={'true'} />
			</div>

			<div className={'flex min-w-0 flex-1 items-center justify-between gap-2'}>
				<p className={'truncate text-sm'}>
					{'Created list '}
					<span className={'font-semibold'}>{item.list?.name ?? 'Unnamed list'}</span>
				</p>

				<time
					className={'shrink-0 text-xs text-muted-foreground'}
					dateTime={item.createdAt}>
					{formatRelativeTime(item.createdAt)}
				</time>
			</div>
		</article>
	)
}

function ListAddGameItem(props: Props) {
	const { item } = props

	return (
		<article className={'flex items-center gap-3 py-3'}>
			{item.game && (
				<Link href={gameHref(item)} className={'shrink-0'}>
					<BoxArt
						className={'w-10 rounded-sm'}
						gameRecord={item.game}
					/>
				</Link>
			)}

			<div className={'flex min-w-0 flex-1 items-center justify-between gap-2'}>
				<p className={'truncate text-sm'}>
					{'Added '}
					{item.game && (
						<Link href={gameHref(item)} className={'font-semibold text-foreground hover:text-primary'}>
							{item.game.name}
						</Link>
					)}
					{' to '}
					<span className={'font-semibold'}>{item.list?.name ?? 'a list'}</span>
				</p>

				<time
					className={'shrink-0 text-xs text-muted-foreground'}
					dateTime={item.createdAt}>
					{formatRelativeTime(item.createdAt)}
				</time>
			</div>
		</article>
	)
}

export function ProfileActivityItem(props: Props) {
	const { item } = props

	switch (item.type) {
		case 'review':
			return <ReviewItem item={item} />
		case 'listCreate':
			return <ListCreateItem item={item} />
		case 'listAddGame':
			return <ListAddGameItem item={item} />
		default:
			return <LikeItem item={item} />
	}
}
