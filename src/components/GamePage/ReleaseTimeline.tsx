'use client'

// Module imports
import { format } from 'date-fns'
import { useEffect, useMemo, useRef } from 'react'

// Local imports
import { type Release } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'
import { cn } from '@/lib/utils'

// Constants
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
	advancedAccess: 'Advanced Access',
	alpha: 'Alpha',
	beta: 'Beta',
	cancelled: 'Cancelled',
	digitalCompatibilityRelease: 'Digital Compatibility',
	earlyAccess: 'Early Access',
	nextGenOptimizationRelease: 'Next-Gen Optimization',
	offline: 'Offline',
}

// Types
type Props = Readonly<{
	releases: Release[]
}>

type TimelineEvent = {
	id: string
	platform: string
	region: string
	status: string
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

// Helper to format the display date based on format
function formatDisplayDate(
	releasedAt: string | undefined,
	releasedAtFormat: string | undefined,
): string {
	if (!releasedAtFormat || releasedAtFormat === 'TBD') {
		return 'TBD'
	}

	if (!releasedAt) {
		return 'TBD'
	}

	const date = new Date(releasedAt)
	if (isNaN(date.getTime())) {
		return releasedAt
	}

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

// Helper to get a sortable date
function getSortDate(
	releasedAt: string | undefined,
	releasedAtFormat: string | undefined,
): Date | null {
	if (!releasedAt || releasedAtFormat === 'TBD') {
		return null
	}

	const date = new Date(releasedAt)
	return isNaN(date.getTime()) ? null : date
}

export function ReleaseTimeline(props: Props) {
	const { releases } = props
	const scrollerRef = useRef<HTMLDivElement>(null)
	const contentRef = useRef<HTMLDivElement>(null)

	// Flatten releases into timeline events, sort by date, then group by date
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

		// Sort by date (earliest first), with TBD items at the end
		events.sort((a, b) => {
			if (!a.sortDate && !b.sortDate) return 0
			if (!a.sortDate) return 1
			if (!b.sortDate) return -1
			return a.sortDate.getTime() - b.sortDate.getTime()
		})

		// Group events by displayDate
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

	// Find the index of the most recent past release
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

	// Scroll to show the most recent item on mount
	useEffect(() => {
		if (scrollerRef.current) {
			// Scroll to the right to show the most recent item
			scrollerRef.current.scrollLeft = scrollerRef.current.scrollWidth
		}
	}, [dateGroups])

	if (dateGroups.length === 0) {
		return (
			<div>
				<p className={'text-muted-foreground text-center py-8'}>
					{'No release information available.'}
				</p>
			</div>
		)
	}

	return (
		<div className={'relative w-[100vw] -ml-[calc((100vw-100%)/2)]'}>
			{/* Scrollable container */}
			<div
				ref={scrollerRef}
				className={'overflow-x-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent'}>
				{/* Content wrapper with min-width to allow centering when content is narrow */}
				<div className={'flex min-w-full'}>
					{/* Left spacer - fills remaining space, pushes content right */}
					<div className={'flex-1'} />

					{/* Timeline content - right padding matches container edge */}
					<div
						ref={contentRef}
						className={'relative flex items-start py-4 pr-4 mr-[max(0px,calc((100vw-72rem)/2))]'}>
						{/* Through line - extends from left edge of viewport to the last dot */}
						<div
							className={'absolute top-[calc(1rem+0.4375rem)] h-0.5 bg-border'}
							style={{
								left: '-100vw',
								right: 'calc(0.4375rem)',
							}}
							aria-hidden="true"
						/>
						{/* Active portion of the line - from left edge to active dot */}
						{activeIndex >= 0 && (
							<div
								className={'absolute top-[calc(1rem+0.4375rem)] h-0.5 bg-primary transition-all'}
								style={{
									left: '-100vw',
									width: `calc(100vw + ${(activeIndex / Math.max(dateGroups.length - 1, 1)) * 100}% + 0.4375rem)`,
								}}
								aria-hidden="true"
							/>
						)}

						{dateGroups.map((group, index) => {
							const isPast = group.sortDate && group.sortDate <= new Date()
							const isActive = index === activeIndex
							const isLast = index === dateGroups.length - 1

							return (
								<div
									key={group.displayDate}
									className={cn(
										'relative flex flex-col items-center',
										!isLast && 'pr-8 md:pr-12',
									)}>
									{/* Dot */}
									<div
										className={cn(
											'relative z-10 size-3.5 rounded-full border-2 bg-background shrink-0',
											isPast || isActive ? 'border-primary' : 'border-border',
										)}
									/>

									{/* Content */}
									<div className={'mt-3 flex flex-col items-center text-center min-w-[120px]'}>
										<time
											dateTime={group.dateTime}
											className={cn(
												'text-xs font-medium whitespace-nowrap',
												isActive ? 'text-primary' : 'text-muted-foreground',
											)}>
											{group.displayDate}
										</time>

										<div className={'mt-2 flex flex-col gap-2'}>
											{group.events.map((event) => (
												<div
													key={event.id}
													className={'text-sm'}>
													<div className={'font-semibold whitespace-nowrap'}>
														{event.platform}
													</div>
													<div className={'text-muted-foreground text-xs whitespace-nowrap'}>
														{event.status}
														{event.region !== 'Worldwide' && ` — ${event.region}`}
													</div>
												</div>
											))}
										</div>
									</div>
								</div>
							)
						})}
					</div>
				</div>
			</div>
		</div>
	)
}
