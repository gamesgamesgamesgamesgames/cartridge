'use client'

import { Heart, List, Star } from 'lucide-react'
import Link from 'next/link'

import { BoxArt } from '@/components/BoxArt/BoxArt'
import { Container } from '@/components/Container/Container'
import { Header } from '@/components/Header/Header'
import { Skeleton } from '@/components/ui/skeleton'
import { StarRating } from '@/components/StarRating/StarRating'
import { type CommunityFeedItem, type PlatformStats } from '@/helpers/API'

type Props = Readonly<{
	feed: CommunityFeedItem[]
	stats: PlatformStats | null
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

function extractRkey(uri: string): string {
	const parts = uri.split('/')
	return parts[parts.length - 1]
}

function actorHandle(actor: CommunityFeedItem['actor']): string {
	return actor.handle ?? actor.did
}

function actorHref(actor: CommunityFeedItem['actor']): string {
	return `/profile/${actorHandle(actor)}`
}

function listHref(actor: CommunityFeedItem['actor'], listUri: string): string {
	return `/profile/${actorHandle(actor)}/list/${extractRkey(listUri)}`
}

function ActionIcon({ type }: { type: CommunityFeedItem['type'] }) {
	switch (type) {
		case 'review':
			return <Star className={'size-3.5 shrink-0 text-primary'} />
		case 'listCreate':
		case 'listAddGame':
			return <List className={'size-3.5 shrink-0 text-primary'} />
		default:
			return <Heart className={'size-3.5 shrink-0 fill-current text-liked'} />
	}
}

function ActorName({ actor }: { actor: CommunityFeedItem['actor'] }) {
	const name = actor.displayName ?? actor.handle ?? 'Someone'
	return <Link href={actorHref(actor)} className={'font-medium hover:text-primary'}>{name}</Link>
}

function ActivityItemContent({ item }: { item: CommunityFeedItem }) {
	const gameHref = item.game?.slug ? `/game/${item.game.slug}` : undefined

	switch (item.type) {
		case 'like':
			return (
				<p className={'min-w-0 truncate text-sm'}>
					<ActorName actor={item.actor} />
					<span className={'text-muted-foreground'}>{' liked '}</span>
					{item.game && gameHref ? (
						<Link href={gameHref} className={'font-medium hover:text-primary'}>{item.game.name}</Link>
					) : null}
				</p>
			)
		case 'review':
			return (
				<p className={'min-w-0 truncate text-sm'}>
					<ActorName actor={item.actor} />
					<span className={'text-muted-foreground'}>{' reviewed '}</span>
					{item.game && gameHref ? (
						<Link href={gameHref} className={'font-medium hover:text-primary'}>{item.game.name}</Link>
					) : null}
				</p>
			)
		case 'listAddGame':
			return (
				<p className={'min-w-0 truncate text-sm'}>
					<ActorName actor={item.actor} />
					<span className={'text-muted-foreground'}>{' added '}</span>
					{item.game && gameHref ? (
						<Link href={gameHref} className={'font-medium hover:text-primary'}>{item.game.name}</Link>
					) : null}
					{item.list && (
						<>
							<span className={'text-muted-foreground'}>{' to '}</span>
							<Link href={listHref(item.actor, item.list.uri)} className={'font-medium hover:text-primary'}>{item.list.name}</Link>
						</>
					)}
				</p>
			)
		case 'listCreate':
			return (
				<p className={'min-w-0 truncate text-sm'}>
					<ActorName actor={item.actor} />
					<span className={'text-muted-foreground'}>{' created '}</span>
					{item.list && (
						<Link href={listHref(item.actor, item.list.uri)} className={'font-medium hover:text-primary'}>{item.list.name}</Link>
					)}
				</p>
			)
	}
}

function ActivityItem({ item }: { item: CommunityFeedItem }) {
	const gameHref = item.game?.slug ? `/game/${item.game.slug}` : undefined

	return (
		<article className={'flex items-center gap-3 py-2.5'}>
			{item.game && gameHref && (
				<Link href={gameHref} className={'shrink-0'}>
					<BoxArt
						className={'w-8 rounded-sm'}
						gameRecord={item.game}
					/>
				</Link>
			)}

			<div className={'flex min-w-0 flex-1 flex-col gap-0.5'}>
				<div className={'flex items-center gap-2'}>
					<ActionIcon type={item.type} />
					<ActivityItemContent item={item} />
					<time className={'ml-auto shrink-0 text-xs text-muted-foreground'} dateTime={item.createdAt}>
						{formatRelativeTime(item.createdAt)}
					</time>
				</div>
				{item.type === 'review' && item.review && (
					<div className={'ml-5.5'}>
						<StarRating rating={item.review.rating} compact />
					</div>
				)}
			</div>
		</article>
	)
}

function formatStat(n: number): string {
	if (n >= 1000) return n.toLocaleString() + '+'
	return String(n)
}

function EmptyState({ stats }: { stats: PlatformStats | null }) {
	const statItems = stats ? [
		stats.totalGames > 0 && `${formatStat(stats.totalGames)} games`,
		stats.totalStudios > 0 && `${formatStat(stats.totalStudios)} studios`,
		stats.totalReviews > 0 && `${formatStat(stats.totalReviews)} reviews`,
	].filter(Boolean) : []

	return (
		<div className={'flex flex-col items-center gap-4 py-10 text-center'}>
			<p className={'text-sm text-muted-foreground'}>
				{'The community is just getting started.'}
				{statItems.length > 0 && ` ${statItems.join(', ')} and counting.`}
			</p>
			<Link
				href={'/browse'}
				className={'rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90'}>
				{'Explore the catalog'}
			</Link>
		</div>
	)
}

export function CommunityActivity({ feed, stats }: Props) {
	const hasActivity = feed.length > 0

	return (
		<section className={'bg-card/40 py-10'}>
			<Container>
				<Header className={'mb-4'} level={3}>
					{'What\'s Happening'}
				</Header>

				{hasActivity ? (
					<div className={'grid gap-x-10 md:grid-cols-2'}>
						<div className={'divide-y divide-border'}>
							{feed.slice(0, Math.ceil(feed.length / 2)).map((item, i) => (
								<ActivityItem key={`${item.type}-${item.actor.did}-${i}`} item={item} />
							))}
						</div>
						<div className={'divide-y divide-border'}>
							{feed.slice(Math.ceil(feed.length / 2)).map((item, i) => (
								<ActivityItem key={`${item.type}-${item.actor.did}-${i}`} item={item} />
							))}
						</div>
					</div>
				) : (
					<EmptyState stats={stats} />
				)}
			</Container>
		</section>
	)
}

export function CommunityActivitySkeleton() {
	return (
		<section className={'bg-card/40 py-10'}>
			<Container>
				<Skeleton className={'mb-4 h-8 w-48'} />
				<div className={'grid gap-x-10 md:grid-cols-2'}>
					{[0, 1].map((col) => (
						<div key={col} className={'flex flex-col gap-4'}>
							{Array.from({ length: 5 }, (_, i) => (
								<div key={i} className={'flex items-center gap-3'}>
									<Skeleton className={'size-8 shrink-0 rounded-sm'} />
									<Skeleton className={'h-4 flex-1'} />
									<Skeleton className={'h-3 w-10'} />
								</div>
							))}
						</div>
					))}
				</div>
			</Container>
		</section>
	)
}
