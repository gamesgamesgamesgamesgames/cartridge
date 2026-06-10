'use client'

import { Heart, List, MessageSquare } from 'lucide-react'
import Link from 'next/link'

import { BoxArt } from '@/components/BoxArt/BoxArt'
import { Header } from '@/components/Header/Header'
import { Scroller } from '@/components/ui/scroller'
import { StarRating } from '@/components/StarRating/StarRating'
import { type CommunityFeedItem } from '@/helpers/API'

type Props = Readonly<{
	id?: string
	items: CommunityFeedItem[]
}>

const ACTIVITY_ICONS = {
	like: <Heart className={'size-3.5 fill-current text-liked'} aria-hidden={'true'} />,
	review: <MessageSquare className={'size-3.5 text-primary'} aria-hidden={'true'} />,
	listCreate: <List className={'size-3.5 text-muted-foreground'} aria-hidden={'true'} />,
	listAddGame: <List className={'size-3.5 text-muted-foreground'} aria-hidden={'true'} />,
} as const

function getActionVerb(type: CommunityFeedItem['type']): string {
	switch (type) {
		case 'like': return 'liked'
		case 'review': return 'reviewed'
		case 'listAddGame': return 'added to a list'
		case 'listCreate': return 'created a list'
	}
}

function formatTimeAgo(dateStr: string): string {
	const now = Date.now()
	const then = new Date(dateStr).getTime()
	const diffMs = now - then
	const minutes = Math.floor(diffMs / 60_000)
	if (minutes < 1) return 'just now'
	if (minutes < 60) return `${minutes}m`
	const hours = Math.floor(minutes / 60)
	if (hours < 24) return `${hours}h`
	const days = Math.floor(hours / 24)
	if (days < 7) return `${days}d`
	return `${Math.floor(days / 7)}w`
}

function ActivityCard({ item }: { item: CommunityFeedItem }) {
	const game = item.game
	const href = game?.slug ? `/game/${game.slug}` : undefined
	const actorName = item.actor.displayName ?? item.actor.handle ?? 'Someone'

	const inner = (
		<div className={'flex w-72 gap-3 rounded-lg bg-card/40 p-3 transition-colors hover:bg-card/60'}>
			{game && (
				<div className={'w-16 shrink-0'}>
					<BoxArt gameRecord={game} />
				</div>
			)}

			<div className={'flex min-w-0 flex-1 flex-col justify-center gap-1'}>
				<span className={'truncate text-sm font-semibold'}>
					{game?.name ?? item.list?.name ?? 'Unknown'}
				</span>

				<div className={'flex items-center gap-1.5 text-xs text-muted-foreground'}>
					{ACTIVITY_ICONS[item.type]}
					<span className={'truncate'}>
						{actorName}
						{' '}
						{getActionVerb(item.type)}
					</span>
					<span className={'shrink-0 opacity-60'}>
						{'·'}
					</span>
					<span className={'shrink-0 opacity-60'}>
						{formatTimeAgo(item.createdAt)}
					</span>
				</div>

				{item.type === 'review' && item.review && (
					<StarRating rating={item.review.rating} compact />
				)}
				{item.type === 'review' && item.review?.text && (
					<p className={'line-clamp-2 text-xs text-muted-foreground'}>
						{item.review.text}
					</p>
				)}
			</div>
		</div>
	)

	if (!href) return <div className={'shrink-0'}>{inner}</div>

	return (
		<Link
			href={href}
			className={'block shrink-0 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'}>
			{inner}
		</Link>
	)
}

export function CommunityActivitySection({ id, items }: Props) {
	if (items.length === 0) return null

	return (
		<section id={id} className={'scroll-mt-32'}>
			<div className={'mb-4 flex items-baseline justify-between px-4 md:px-10 lg:px-16'}>
				<Header className={'text-xl'} level={3}>
					{'Community Activity'}
				</Header>
			</div>

			<Scroller
				aria-label={'Recent community activity'}
				orientation={'horizontal'}
				hideScrollbar
				withNavigation
				size={60}
				scrollStep={300}
				className={'flex gap-3 px-4 py-2 md:px-10 lg:px-16'}>
				{items.map((item, i) => (
					<ActivityCard key={`${item.type}-${item.createdAt}-${i}`} item={item} />
				))}
			</Scroller>
		</section>
	)
}
