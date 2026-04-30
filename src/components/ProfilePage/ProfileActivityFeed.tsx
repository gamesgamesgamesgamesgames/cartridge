'use client'

// Module imports
import { Loader2 } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

// Local imports
import { ProfileActivityItem } from '@/components/ProfilePage/ProfileActivityItem'
import * as API from '@/helpers/API'
import { type ActivityFeedItem } from '@/helpers/API'

// Types
type Props = Readonly<{
	profileDid: string
}>

type DateGroup = {
	label: string
	items: ActivityFeedItem[]
}

function getDateLabel(dateString: string): string {
	const date = new Date(dateString)
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

export function ProfileActivityFeed(props: Props) {
	const { profileDid } = props

	const [items, setItems] = useState<ActivityFeedItem[]>([])
	const [cursor, setCursor] = useState<string | undefined>(undefined)
	const [isLoading, setIsLoading] = useState(true)
	const sentinelRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		API.getActivityFeed(profileDid, 30).then((result) => {
			setItems(result.feed)
			setCursor(result.cursor)
			setIsLoading(false)
		}).catch(() => {
			setIsLoading(false)
		})
	}, [profileDid])

	const loadMore = useCallback(() => {
		if (!cursor || isLoading) return
		setIsLoading(true)
		API.getActivityFeed(profileDid, 30, cursor).then((result) => {
			setItems((prev) => [...prev, ...result.feed])
			setCursor(result.cursor)
			setIsLoading(false)
		}).catch(() => {
			setIsLoading(false)
		})
	}, [profileDid, cursor, isLoading])

	useEffect(() => {
		const el = sentinelRef.current
		if (!el || !cursor || isLoading) return

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
	}, [cursor, isLoading, loadMore])

	if (isLoading && items.length === 0) {
		return (
			<div className={'flex items-center justify-center py-12'}>
				<Loader2 className={'size-6 animate-spin text-muted-foreground'} />
			</div>
		)
	}

	if (items.length === 0) {
		return (
			<p className={'py-8 text-muted-foreground'}>
				{'No activity yet.'}
			</p>
		)
	}

	const dateGroups = groupByDate(items)

	return (
		<div>
			{dateGroups.map((group) => (
				<div key={group.label}>
					<div className={'sticky top-0 z-10 -mx-1 bg-secondary/80 px-1 py-2 backdrop-blur-sm'}>
						<h3 className={'text-xs font-semibold uppercase tracking-wider text-muted-foreground'}>
							{group.label}
						</h3>
					</div>

					<div className={'divide-y divide-border'}>
						{group.items.map((item, index) => (
							<ProfileActivityItem
								key={`${item.type}-${item.game.uri}-${index}`}
								item={item}
							/>
						))}
					</div>
				</div>
			))}

			<div ref={sentinelRef} />

			{isLoading && (
				<div className={'flex justify-center py-6'}>
					<Loader2 className={'size-5 animate-spin text-muted-foreground'} />
				</div>
			)}
		</div>
	)
}
