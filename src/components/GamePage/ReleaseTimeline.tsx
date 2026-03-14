'use client'

// Module imports
import { format } from 'date-fns'
import { useMemo } from 'react'

// Local imports
import { type Release } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'
import {
	Timeline,
	TimelineConnector,
	TimelineContent,
	TimelineDescription,
	TimelineDot,
	TimelineHeader,
	TimelineItem,
	TimelineTime,
	TimelineTitle,
} from '@/components/ui/timeline'

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

	// Find the index of the most recent past release (for activeIndex)
	const activeIndex = useMemo(() => {
		const now = new Date()
		let lastPastIndex = -1

		for (let i = 0; i < dateGroups.length; i++) {
			const group = dateGroups[i]
			if (group.sortDate && group.sortDate <= now) {
				lastPastIndex = i
			}
		}

		return lastPastIndex >= 0 ? lastPastIndex : undefined
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
		<Timeline
			activeIndex={activeIndex}
			className={'gap-0'}>
			{dateGroups.map((group) => (
				<TimelineItem
					key={group.displayDate}
					className={'pr-10'}>
					<TimelineDot />
					<TimelineConnector />
					<div className={'flex flex-col gap-4'}>
						<TimelineTime
							className={'whitespace-nowrap'}
							dateTime={group.dateTime}>
							{group.displayDate}
						</TimelineTime>

						{group.events.map((event) => (
							<TimelineContent key={event.id}>
								<TimelineHeader>
									<TimelineTitle className={'whitespace-nowrap'}>
										{event.platform}
									</TimelineTitle>
								</TimelineHeader>

								<TimelineDescription>{`${event.status} - ${event.region}`}</TimelineDescription>
							</TimelineContent>
						))}
					</div>
				</TimelineItem>
			))}
		</Timeline>
	)
}
