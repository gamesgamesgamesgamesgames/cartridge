'use client'

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'

import { BoxArt } from '@/components/BoxArt/BoxArt'
import { TiltCard } from '@/components/TiltCard/TiltCard'
import * as API from '@/helpers/API'
import { type GameFeedGame } from '@/helpers/API'

type Props = Readonly<{
	initialGames: GameFeedGame[]
	initialCursor?: string
	now: string
}>

type DateGroup = {
	key: string
	label: string
	games: GameFeedGame[]
}

function getFirstReleaseDate(game: GameFeedGame): string | undefined {
	if (game.firstReleaseDate) return game.firstReleaseDate

	let earliest: string | undefined
	for (const release of game.releases ?? []) {
		for (const rd of release.releaseDates ?? []) {
			if (rd.releasedAt && (!earliest || rd.releasedAt < earliest)) {
				earliest = rd.releasedAt
			}
		}
	}
	return earliest
}

function formatReleaseDate(date: string): string {
	const match = date.match(/^(\d{4})-(\d{2})-(\d{2})/)
	if (match) {
		return new Date(
			`${match[1]}-${match[2]}-${match[3]}T00:00:00`,
		).toLocaleDateString(undefined, {
			month: 'short',
			day: 'numeric',
		})
	}

	const monthMatch = date.match(/^(\d{4})-(\d{2})$/)
	if (monthMatch) {
		return new Date(
			`${monthMatch[1]}-${monthMatch[2]}-01T00:00:00`,
		).toLocaleDateString(undefined, { month: 'short' })
	}

	return date
}

const MONTH_NAMES = [
	'January', 'February', 'March', 'April', 'May', 'June',
	'July', 'August', 'September', 'October', 'November', 'December',
]

function buildDateGroups(games: GameFeedGame[], nowStr: string): DateGroup[] {
	const currentYear = parseInt(nowStr.slice(0, 4), 10)
	const currentMonth = parseInt(nowStr.slice(4, 6), 10)

	const monthKeys: string[] = []
	for (let i = 0; i < 6; i++) {
		let m = currentMonth + i
		let y = currentYear
		if (m > 12) {
			m -= 12
			y += 1
		}
		monthKeys.push(`${y}-${String(m).padStart(2, '0')}`)
	}

	const lastMonthKey = monthKeys[monthKeys.length - 1]!
	const lastMonthYear = parseInt(lastMonthKey.slice(0, 4), 10)
	const lastMonthMonth = parseInt(lastMonthKey.slice(5, 7), 10)

	const groupMap = new Map<string, GameFeedGame[]>()

	for (const game of games) {
		const dateStr = getFirstReleaseDate(game)
		if (!dateStr) continue

		const yearStr = dateStr.slice(0, 4)
		const monthStr = dateStr.slice(5, 7)
		const year = parseInt(yearStr, 10)
		const month = parseInt(monthStr, 10)

		if (isNaN(year)) continue

		const gameMonthKey = `${yearStr}-${monthStr}`

		let groupKey: string
		if (monthKeys.includes(gameMonthKey)) {
			groupKey = gameMonthKey
		} else if (year === lastMonthYear && month > lastMonthMonth) {
			groupKey = `rest-${year}`
		} else if (year > lastMonthYear) {
			groupKey = `year-${year}`
		} else {
			continue
		}

		const existing = groupMap.get(groupKey)
		if (existing) {
			existing.push(game)
		} else {
			groupMap.set(groupKey, [game])
		}
	}

	const groups: DateGroup[] = []

	for (const mk of monthKeys) {
		const games = groupMap.get(mk)
		if (!games || games.length === 0) continue

		const [y, m] = mk.split('-').map(Number) as [number, number]
		groups.push({
			key: mk,
			label: `${MONTH_NAMES[m - 1]} ${y}`,
			games,
		})
	}

	const restKey = `rest-${lastMonthYear}`
	const restGames = groupMap.get(restKey)
	if (restGames && restGames.length > 0) {
		groups.push({
			key: restKey,
			label: `The Rest of ${lastMonthYear}`,
			games: restGames,
		})
	}

	const yearKeys = Array.from(groupMap.keys())
		.filter((k) => k.startsWith('year-'))
		.sort()

	for (const yk of yearKeys) {
		const games = groupMap.get(yk)!
		const year = yk.replace('year-', '')
		groups.push({
			key: yk,
			label: year,
			games,
		})
	}

	return groups
}

export function UpcomingReleasesContent(props: Props) {
	const { initialGames, initialCursor, now } = props
	const [games, setGames] = useState(initialGames)
	const [cursor, setCursor] = useState(initialCursor)
	const [isPending, startTransition] = useTransition()
	const sentinelRef = useRef<HTMLDivElement>(null)

	const groups = useMemo(() => buildDateGroups(games, now), [games, now])

	const loadMore = useCallback(() => {
		if (!cursor || isPending) return
		startTransition(async () => {
			const result = await API.getUpcomingReleases(100, cursor, now)
			setGames((prev) => [...prev, ...result.feed])
			setCursor(result.cursor)
		})
	}, [cursor, isPending, now])

	useEffect(() => {
		const sentinel = sentinelRef.current
		if (!sentinel || !cursor) return

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) {
					loadMore()
				}
			},
			{ rootMargin: '400px' },
		)

		observer.observe(sentinel)
		return () => observer.disconnect()
	}, [cursor, loadMore])

	if (groups.length === 0) {
		return (
			<div className={'flex flex-col items-center gap-2 py-16'}>
				<p className={'text-muted-foreground'}>
					{'No upcoming releases found.'}
				</p>
			</div>
		)
	}

	return (
		<div className={'flex flex-col gap-12'}>
			{groups.map((group) => (
				<section key={group.key}>
					<h2 className={'mb-4 font-[family-name:var(--font-cartridge)] text-xl font-black md:text-2xl'}>
						{group.label}
					</h2>

					<div className={'grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8'}>
						{group.games.map((game) => {
							const releaseDate = getFirstReleaseDate(game)
							const href = game.slug ? `/game/${game.slug}` : undefined

							const content = (
								<>
									<TiltCard>
										<BoxArt gameRecord={game} />
									</TiltCard>
									<div className={'mt-1.5 px-0.5'}>
										<div className={'truncate text-sm font-medium'}>
											{game.name}
										</div>
										{releaseDate && (
											<div className={'truncate text-xs text-muted-foreground'}>
												{formatReleaseDate(releaseDate)}
											</div>
										)}
									</div>
								</>
							)

							if (!href) {
								return (
									<div key={game.uri} className={'opacity-60'}>
										{content}
									</div>
								)
							}

							return (
								<Link
									key={game.uri}
									href={href}
									className={'rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'}>
									{content}
								</Link>
							)
						})}
					</div>
				</section>
			))}

			{cursor && (
				<div ref={sentinelRef} className={'flex justify-center py-8'}>
					{isPending && (
						<Loader2 className={'size-6 animate-spin text-muted-foreground'} />
					)}
				</div>
			)}
		</div>
	)
}
