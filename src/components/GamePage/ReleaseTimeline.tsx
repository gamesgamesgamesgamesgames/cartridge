'use client'

import { format } from 'date-fns'
import { useCallback, useMemo } from 'react'

import { Scroller } from '@/components/ui/scroller'
import { type Release } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'
import { cn } from '@/lib/utils'

const REGIONS: Record<string, string> = {
	worldwide: 'Worldwide',
	europe: 'Europe',
	northAmerica: 'North America',
	australia: 'Australia',
	newZealand: 'New Zealand',
	japan: 'Japan',
	china: 'China',
	asia: 'Asia',
	korea: 'Korea',
	brazil: 'Brazil',
}

const STATUSES: Record<string, string> = {
	release: 'Full Release',
	fullrelease: 'Full Release',
	advancedAccess: 'Advanced Access',
	alpha: 'Alpha',
	beta: 'Beta',
	cancelled: 'Cancelled',
	digitalCompatibilityRelease: 'Digital Compatibility',
	earlyAccess: 'Early Access',
	earlyaccess: 'Early Access',
	nextGenOptimizationRelease: 'Next-Gen Optimization',
	offline: 'Offline',
}

type Props = Readonly<{
	releases: Release[]
}>

type TimelineEvent = {
	id: string
	platform: string
	region: string
	status: string
	statusKey: string
	dateTime: string
	displayDate: string
	sortDate: Date | null
}

type DateGroup = {
	displayDate: string
	dateTime: string
	sortDate: Date | null
	events: TimelineEvent[]
}

function formatDisplayDate(
	releasedAt: string | undefined,
	releasedAtFormat: string | undefined,
): string {
	if (!releasedAtFormat || releasedAtFormat === 'TBD') return 'TBD'
	if (!releasedAt) return 'TBD'

	const date = new Date(releasedAt)
	if (isNaN(date.getTime())) return releasedAt

	switch (releasedAtFormat) {
		case 'YYYY-MM-DD':
			return format(date, 'MMMM d, yyyy')
		case 'YYYY-MM':
			return format(date, 'MMMM yyyy')
		case 'YYYY-Q1':
		case 'YYYY-Q2':
		case 'YYYY-Q3':
		case 'YYYY-Q4':
			return `${releasedAtFormat.slice(-2)} ${date.getFullYear()}`
		case 'YYYY':
			return `${date.getFullYear()}`
		default:
			return releasedAt
	}
}

function getSortDate(
	releasedAt: string | undefined,
	releasedAtFormat: string | undefined,
): Date | null {
	if (!releasedAt || releasedAtFormat === 'TBD') return null
	const date = new Date(releasedAt)
	return isNaN(date.getTime()) ? null : date
}

export function ReleaseTimeline(props: Props) {
	const { releases } = props

	const dateGroups = useMemo<DateGroup[]>(() => {
		const events: TimelineEvent[] = []

		for (const release of releases) {
			if (!release.releaseDates) continue

			for (const releaseDate of release.releaseDates) {
				const statusKey = releaseDate.status ?? 'release'
				events.push({
					id: `${release.platform}-${releaseDate.region}-${statusKey}-${releaseDate.releasedAt}`,
					platform: release.platform ?? 'Unknown Platform',
					region:
						REGIONS[releaseDate.region ?? ''] ??
						releaseDate.region ??
						'Unknown Region',
					status: STATUSES[statusKey] ?? statusKey,
					statusKey,
					dateTime: releaseDate.releasedAt ?? '',
					displayDate: formatDisplayDate(
						releaseDate.releasedAt,
						releaseDate.releasedAtFormat,
					),
					sortDate: getSortDate(
						releaseDate.releasedAt,
						releaseDate.releasedAtFormat,
					),
				})
			}
		}

		events.sort((a, b) => {
			if (!a.sortDate && !b.sortDate) return 0
			if (!a.sortDate) return 1
			if (!b.sortDate) return -1
			return a.sortDate.getTime() - b.sortDate.getTime()
		})

		const groupedMap = new Map<string, DateGroup>()
		for (const event of events) {
			if (!groupedMap.has(event.displayDate)) {
				groupedMap.set(event.displayDate, {
					displayDate: event.displayDate,
					dateTime: event.dateTime,
					sortDate: event.sortDate,
					events: [],
				})
			}
			groupedMap.get(event.displayDate)!.events.push(event)
		}

		return Array.from(groupedMap.values())
	}, [releases])

	const activeIndex = useMemo(() => {
		const now = new Date()
		let lastPastIndex = -1

		for (let i = 0; i < dateGroups.length; i++) {
			const group = dateGroups[i]
			if (group.sortDate && group.sortDate <= now) {
				lastPastIndex = i
			}
		}

		return lastPastIndex >= 0 ? lastPastIndex : dateGroups.length - 1
	}, [dateGroups])

	const activeScrollRef = useCallback((node: HTMLDivElement | null) => {
		if (node) {
			requestAnimationFrame(() => {
				node.scrollIntoView({ inline: 'center', block: 'nearest' })
			})
		}
	}, [])

	if (dateGroups.length === 0) {
		return (
			<p className={'text-muted-foreground text-center py-8'}>
				{'No release information available.'}
			</p>
		)
	}

	return (
		<Scroller
			orientation={'horizontal'}
			hideScrollbar
			withNavigation
			scrollStep={280}
			className={'-mx-4 flex gap-0 px-4 pb-2 pt-1'}>
			{dateGroups.map((group, index) => {
				const isPast = group.sortDate && group.sortDate <= new Date()
				const isActive = index === activeIndex
				const isFuture = !isPast && !isActive
				const isFirst = index === 0
				const isLast = index === dateGroups.length - 1
				const isCancelled = group.events.every(
					(e) => e.statusKey === 'cancelled',
				)

				return (
					<div
						key={group.displayDate}
						ref={isActive ? activeScrollRef : undefined}
						className={'flex shrink-0 flex-col items-center'}
						style={{ minWidth: '156px' }}>
						{/* Rail: left segment + dot + right segment */}
						<div className={'flex w-full items-center'}>
							<div
								className={cn(
									'h-0.5 flex-1',
									isFirst
										? 'bg-transparent'
										: index <= activeIndex
											? 'bg-primary'
											: 'bg-border',
								)}
							/>
							<div
								className={cn(
									'size-3 shrink-0 rounded-full transition-all',
									isCancelled &&
										'border-2 border-destructive/50 bg-destructive/10',
									!isCancelled && isPast && 'bg-primary',
									!isCancelled &&
										isActive &&
										'bg-primary ring-[5px] ring-primary/15',
									!isCancelled &&
										isFuture &&
										'border-2 border-border bg-background',
								)}
							/>
							<div
								className={cn(
									'h-0.5 flex-1',
									isLast
										? 'bg-transparent'
										: index < activeIndex
											? 'bg-primary'
											: 'bg-border',
								)}
							/>
						</div>

						{/* Date + event cards */}
						<div
							className={
								'mt-3 flex flex-col items-center px-2'
							}>
							<time
								dateTime={group.dateTime}
								className={cn(
									'whitespace-nowrap text-xs font-semibold',
									isActive && 'text-primary',
									isCancelled && 'text-muted-foreground',
									!isActive &&
										!isCancelled &&
										'text-muted-foreground',
								)}>
								{group.displayDate}
							</time>

							<div className={'mt-2.5 flex flex-col gap-1.5'}>
								{group.events.map((event) => {
									const cancelled =
										event.statusKey === 'cancelled'

									return (
										<div
											key={event.id}
											className={cn(
												'min-w-[130px] rounded-lg border px-3 py-2 text-center',
												cancelled &&
													'border-destructive/20 bg-destructive/5',
												!cancelled &&
													isActive &&
													'border-primary/30 bg-primary/5',
												!cancelled &&
													!isActive &&
													'border-border bg-card',
											)}>
											<div
												className={cn(
													'whitespace-nowrap text-sm font-medium',
													cancelled &&
														'text-muted-foreground line-through',
												)}>
												{event.platform}
											</div>
											<div
												className={
													'whitespace-nowrap text-xs text-muted-foreground'
												}>
												{event.status}
												{event.region !== 'Worldwide' &&
													` · ${event.region}`}
											</div>
										</div>
									)
								})}
							</div>
						</div>
					</div>
				)
			})}
		</Scroller>
	)
}
