'use client'

import { Activity, Loader2, TriangleAlert } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { ProfileActivityItem } from '@/components/ProfilePage/ProfileActivityItem'
import { ProfileFeedFilters, type FilterType } from '@/components/ProfilePage/ProfileFeedFilters'
import { Skeleton } from '@/components/ui/skeleton'
import * as API from '@/helpers/API'
import { type ActivityFeedItem } from '@/helpers/API'

type Props = Readonly<{
	profileDid: string
	isOwnProfile: boolean
}>

type DateGroup = {
	label: string
	items: ActivityFeedItem[]
}

type FeedState = 'loading' | 'loaded' | 'error' | 'empty'

function getDateLabel(dateString: string): string {
	const date = new Date(dateString)
	if (Number.isNaN(date.getTime())) return 'Unknown date'

	const now = new Date()

	const isToday =
		date.getFullYear() === now.getFullYear() &&
		date.getMonth() === now.getMonth() &&
		date.getDate() === now.getDate()

	if (isToday) return 'Today'

	const yesterday = new Date(now)
	yesterday.setDate(yesterday.getDate() - 1)
	const isYesterday =
		date.getFullYear() === yesterday.getFullYear() &&
		date.getMonth() === yesterday.getMonth() &&
		date.getDate() === yesterday.getDate()

	if (isYesterday) return 'Yesterday'

	return date.toLocaleDateString('en-US', {
		month: 'long',
		day: 'numeric',
		year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
	})
}

function groupByDate(items: ActivityFeedItem[]): DateGroup[] {
	const groups: DateGroup[] = []
	let currentLabel = ''
	let currentItems: ActivityFeedItem[] = []

	for (const item of items) {
		const label = getDateLabel(item.createdAt)
		if (label !== currentLabel) {
			if (currentItems.length > 0) {
				groups.push({ label: currentLabel, items: currentItems })
			}
			currentLabel = label
			currentItems = [item]
		} else {
			currentItems.push(item)
		}
	}

	if (currentItems.length > 0) {
		groups.push({ label: currentLabel, items: currentItems })
	}

	return groups
}

function filterItems(items: ActivityFeedItem[], filter: FilterType): ActivityFeedItem[] {
	if (filter === 'all') return items

	return items.filter((item) => {
		switch (filter) {
			case 'review': return item.type === 'review'
			case 'like': return item.type === 'like'
			case 'list': return item.type === 'listCreate' || item.type === 'listAddGame'
			default: return true
		}
	})
}

function FeedSkeleton() {
	return (
		<div className={'flex flex-col gap-4'} aria-hidden={'true'}>
			{Array.from({ length: 5 }, (_, i) => (
				<div key={i} className={'flex items-center gap-3 py-3'}>
					<Skeleton className={'size-10 shrink-0 rounded-sm'} />
					<div className={'flex flex-1 flex-col gap-2'}>
						<Skeleton className={'h-4 w-3/4'} />
						<Skeleton className={'h-3 w-1/3'} />
					</div>
				</div>
			))}
		</div>
	)
}

export function ProfileActivityFeed(props: Props) {
	const { profileDid, isOwnProfile } = props

	const [items, setItems] = useState<ActivityFeedItem[]>([])
	const [cursor, setCursor] = useState<string | undefined>(undefined)
	const [feedState, setFeedState] = useState<FeedState>('loading')
	const [isLoadingMore, setIsLoadingMore] = useState(false)
	const [loadMoreFailed, setLoadMoreFailed] = useState(false)
	const [filter, setFilter] = useState<FilterType>('all')
	const sentinelRef = useRef<HTMLDivElement>(null)
	const liveRef = useRef<HTMLDivElement>(null)

	const fetchFeed = useCallback(() => {
		setFeedState('loading')
		API.getActivityFeed(profileDid, 30)
			.then((result) => {
				setItems(result.feed)
				setCursor(result.cursor)
				setFeedState(result.feed.length === 0 ? 'empty' : 'loaded')
			})
			.catch(() => {
				setFeedState('error')
			})
	}, [profileDid])

	useEffect(() => {
		fetchFeed()
	}, [fetchFeed])

	const loadMore = useCallback(() => {
		if (!cursor || isLoadingMore) return
		setIsLoadingMore(true)
		setLoadMoreFailed(false)
		API.getActivityFeed(profileDid, 30, cursor)
			.then((result) => {
				setItems((prev) => [...prev, ...result.feed])
				setCursor(result.cursor)
				setIsLoadingMore(false)
			})
			.catch(() => {
				setIsLoadingMore(false)
				setLoadMoreFailed(true)
			})
	}, [profileDid, cursor, isLoadingMore])

	useEffect(() => {
		const el = sentinelRef.current
		if (!el || !cursor || isLoadingMore || feedState !== 'loaded') return

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) {
					loadMore()
				}
			},
			{ rootMargin: '600px' },
		)

		observer.observe(el)
		return () => observer.disconnect()
	}, [cursor, isLoadingMore, loadMore, feedState])

	if (feedState === 'loading') {
		return (
			<div>
				<div className={'sr-only'} role={'status'} aria-live={'polite'}>
					{'Loading activity'}
				</div>
				<FeedSkeleton />
			</div>
		)
	}

	if (feedState === 'error') {
		return (
			<div className={'flex flex-col items-center gap-3 py-10'} role={'alert'}>
				<div className={'flex size-10 items-center justify-center rounded-lg bg-destructive/10'}>
					<TriangleAlert className={'size-5 text-destructive'} aria-hidden={'true'} />
				</div>
				<p className={'text-sm text-muted-foreground'}>
					{'Couldn\'t load activity'}
				</p>
				<Button variant={'outline'} size={'sm'} onClick={fetchFeed}>
					{'Try again'}
				</Button>
			</div>
		)
	}

	if (feedState === 'empty') {
		if (!isOwnProfile) {
			return (
				<p className={'py-8 text-center text-sm text-muted-foreground'}>
					{'No activity yet'}
				</p>
			)
		}

		return (
			<div className={'flex flex-col items-center gap-3 py-10'}>
				<div className={'flex size-10 items-center justify-center rounded-lg bg-muted'}>
					<Activity className={'size-5 text-muted-foreground'} aria-hidden={'true'} />
				</div>
				<div className={'flex flex-col items-center gap-1 text-center'}>
					<p className={'text-sm font-medium text-foreground'}>
						{'Your activity feed is waiting'}
					</p>
					<p className={'max-w-xs text-sm text-muted-foreground'}>
						{'Likes, reviews, and list updates show up here as a timeline of your gaming life.'}
					</p>
				</div>
				<Button asChild variant={'outline'} size={'sm'}>
					<Link href={'/browse'}>
						{'Find something to play'}
					</Link>
				</Button>
			</div>
		)
	}

	const filteredItems = filterItems(items, filter)
	const dateGroups = groupByDate(filteredItems)

	return (
		<div ref={liveRef} aria-live={'polite'}>
			<div className={'mb-4'}>
				<ProfileFeedFilters active={filter} onChange={setFilter} />
			</div>

			{filteredItems.length === 0 ? (
				<p className={'py-8 text-center text-sm text-muted-foreground'}>
					{'No activity in this category'}
				</p>
			) : (
				dateGroups.map((group) => (
					<div key={group.label}>
						<div className={'sticky top-14 z-10 -mx-1 bg-background/90 px-1 py-2 backdrop-blur-sm'}>
							<h3 className={'text-sm font-medium text-muted-foreground'}>
								{group.label}
							</h3>
						</div>

						<div className={'divide-y divide-border'}>
							{group.items.map((item, index) => (
								<ProfileActivityItem
									key={`${item.type}-${item.game?.uri ?? item.list?.uri ?? index}-${index}`}
									item={item}
								/>
							))}
						</div>
					</div>
				))
			)}

			<div ref={sentinelRef} />

			{isLoadingMore && (
				<div className={'flex justify-center py-6'}>
					<Loader2
						className={'size-5 animate-spin motion-reduce:animate-none text-muted-foreground'}
						aria-hidden={'true'}
					/>
					<span className={'sr-only'}>{'Loading more activity'}</span>
				</div>
			)}

			{loadMoreFailed && !isLoadingMore && (
				<div className={'flex flex-col items-center gap-2 py-6'}>
					<p className={'text-xs text-muted-foreground'}>{'Couldn\'t load more'}</p>
					<Button variant={'outline'} size={'sm'} onClick={loadMore}>
						{'Try again'}
					</Button>
				</div>
			)}

			{!cursor && filteredItems.length > 0 && (
				<p className={'py-6 text-center text-xs text-muted-foreground'}>
					{'That\'s everything'}
				</p>
			)}
		</div>
	)
}
