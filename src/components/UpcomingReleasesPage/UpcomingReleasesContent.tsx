'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Heart } from 'lucide-react'
import Link from 'next/link'

import { BoxArt } from '@/components/BoxArt/BoxArt'
import { SectionNav, type SectionNavItem } from '@/components/SectionNav/SectionNav'
import { TiltCard } from '@/components/TiltCard/TiltCard'
import { GAME_APPLICATION_TYPES } from '@/constants/GAME_APPLICATION_TYPES'
import { GAME_GENRES } from '@/constants/GAME_GENRES'
import * as API from '@/helpers/API'
import { type GameFeedGame } from '@/helpers/API'
import { formatLikeCount } from '@/helpers/formatLikeCount'
import { useBlobUrl } from '@/hooks/use-blob-url'
import { Skeleton } from '@/components/ui/skeleton'
import { type ApplicationType } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'

const SECTION_FETCH_LIMIT = 100

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Props = Readonly<{
	initialGames: GameFeedGame[]
	initialCursor?: string
	now: string
}>

type SectionConfig = {
	key: string
	label: string
	from: number
	to: number
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

function sectionId(key: string): string {
	return `upcoming-${key}`
}

function addDays(dateInt: number, days: number): number {
	const y = Math.floor(dateInt / 10000)
	const m = Math.floor((dateInt % 10000) / 100)
	const d = dateInt % 100
	const ts = new Date(y, m - 1, d + days)
	return ts.getFullYear() * 10000 + (ts.getMonth() + 1) * 100 + ts.getDate()
}

function dateIntFromStr(dateStr: string): number | null {
	const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/)
	if (!match) return null
	return parseInt(match[1], 10) * 10000 + parseInt(match[2], 10) * 100 + parseInt(match[3], 10)
}

function buildSectionConfigs(nowStr: string): SectionConfig[] {
	const currentYear = parseInt(nowStr.slice(0, 4), 10)
	const currentMonth = parseInt(nowStr.slice(4, 6), 10)
	const todayInt = parseInt(nowStr, 10)

	const sections: SectionConfig[] = []
	let rangeStart = todayInt

	const thisWeekEnd = addDays(todayInt, 7)
	sections.push({ key: 'this-week', label: 'This Week', from: todayInt, to: thisWeekEnd })
	rangeStart = thisWeekEnd

	const nextWeekEnd = addDays(todayInt, 14)
	sections.push({ key: 'next-week', label: 'Next Week', from: rangeStart, to: nextWeekEnd })
	rangeStart = nextWeekEnd

	for (let i = 0; i < 6; i++) {
		let m = currentMonth + i
		let y = currentYear
		if (m > 12) { m -= 12; y++ }

		const lastDay = new Date(y, m, 0).getDate()
		const monthEnd = y * 10000 + m * 100 + lastDay

		if (monthEnd <= rangeStart) continue

		sections.push({
			key: `${y}-${String(m).padStart(2, '0')}`,
			label: `${MONTH_NAMES[m - 1]} ${y}`,
			from: rangeStart,
			to: monthEnd,
		})
		rangeStart = monthEnd
	}

	const lastMonthOffset = currentMonth + 5
	const restYear = lastMonthOffset > 12 ? currentYear + 1 : currentYear
	const yearEnd = restYear * 10000 + 1231

	if (rangeStart < yearEnd) {
		sections.push({
			key: `rest-${restYear}`,
			label: `The Rest of ${restYear}`,
			from: rangeStart,
			to: yearEnd,
		})
		rangeStart = yearEnd
	}

	const nextYear = restYear + 1
	const nextYearEnd = nextYear * 10000 + 1231
	sections.push({
		key: `year-${nextYear}`,
		label: String(nextYear),
		from: rangeStart,
		to: nextYearEnd,
	})

	return sections
}

function distributeInitialGames(
	games: GameFeedGame[],
	sections: SectionConfig[],
): Map<string, GameFeedGame[]> {
	const map = new Map<string, GameFeedGame[]>()

	for (const game of games) {
		const dateStr = getFirstReleaseDate(game)
		if (!dateStr) continue
		const dateInt = dateIntFromStr(dateStr)
		if (dateInt === null) continue

		for (const section of sections) {
			if (dateInt > section.from && dateInt <= section.to) {
				const list = map.get(section.key)
				if (list) {
					list.push(game)
				} else {
					map.set(section.key, [game])
				}
				break
			}
		}
	}

	return map
}

// ---------------------------------------------------------------------------
// Game card
// ---------------------------------------------------------------------------

function UpcomingGameCard({ game }: { game: GameFeedGame }) {
	const releaseDate = getFirstReleaseDate(game)
	const href = game.slug ? `/game/${game.slug}` : undefined
	const likeCount = game.likeCount ?? 0

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

				{Boolean(game.genres?.length) && (
					<div className={'mt-0.5 truncate text-xs text-muted-foreground'}>
						{game.genres!.slice(0, 2).map((g) => GAME_GENRES[g]?.name ?? g).join(', ')}
					</div>
				)}

				<div className={'flex items-center justify-between gap-2 text-xs text-muted-foreground'}>
					<span className={'truncate'}>
						{game.applicationType
							? GAME_APPLICATION_TYPES[game.applicationType as ApplicationType]?.name ?? game.applicationType
							: undefined}
					</span>
					{likeCount > 0 && (
						<span className={'flex shrink-0 items-center gap-0.5 text-liked'}>
							<Heart className={'size-3 fill-current'} aria-hidden={'true'} />
							{formatLikeCount(likeCount)}
						</span>
					)}
				</div>
			</div>
		</>
	)

	if (!href) {
		return (
			<div className={'opacity-60'} title={'Release details pending'}>
				{content}
			</div>
		)
	}

	return (
		<Link
			href={href}
			className={'rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'}>
			{content}
		</Link>
	)
}

// ---------------------------------------------------------------------------
// Section headliner — featured card for the most anticipated game
// ---------------------------------------------------------------------------

const HEADLINER_ARTWORK_TYPES = new Set(['artwork'])
const HEADLINER_SCREENSHOT_TYPES = new Set(['screenshot', 'gameplayImage'])

function pickHeadlinerGame(games: GameFeedGame[]): GameFeedGame | null {
	const withArtwork = games.filter((g) =>
		(g.media ?? []).some((m) => HEADLINER_ARTWORK_TYPES.has(m.mediaType ?? '')),
	)
	const withScreenshots = games.filter((g) =>
		(g.media ?? []).some((m) => HEADLINER_SCREENSHOT_TYPES.has(m.mediaType ?? '')),
	)
	const candidates = withArtwork.length > 0 ? withArtwork : withScreenshots
	if (candidates.length === 0) return null
	return candidates.reduce((best, g) => ((g.likeCount ?? 0) > (best.likeCount ?? 0) ? g : best))
}

function SectionHeadliner({ game }: { game: GameFeedGame }) {
	const media = game.media ?? []
	const artworkItem =
		media.find((m) => HEADLINER_ARTWORK_TYPES.has(m.mediaType ?? '')) ??
		media.find((m) => HEADLINER_SCREENSHOT_TYPES.has(m.mediaType ?? ''))

	const blobUrl = useBlobUrl(game.uri, artworkItem?.blob as { ref: unknown } | undefined)
	const releaseDate = getFirstReleaseDate(game)
	const likeCount = game.likeCount ?? 0
	const href = game.slug ? `/game/${game.slug}` : undefined

	if (!blobUrl) return null

	const inner = (
		<div className={'relative size-full overflow-hidden rounded-lg'}>
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img
				alt={''}
				aria-hidden={'true'}
				className={'absolute inset-0 size-full object-cover'}
				src={blobUrl}
			/>
			<div className={'absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent'} />

			<div className={'absolute inset-0 flex items-end p-3 md:p-4'}>
				<div className={'min-w-0'}>
					<p className={'font-[family-name:var(--font-cartridge)] text-base font-black text-white [text-wrap:balance] md:text-xl lg:text-2xl'}>
						{game.name}
					</p>

					<div className={'mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1'}>
						{releaseDate && (
							<span className={'text-xs font-medium text-white/80'}>
								{formatReleaseDate(releaseDate)}
							</span>
						)}
						{game.genres?.slice(0, 2).map((genre) => (
							<span key={genre} className={'rounded-full bg-white/15 px-1.5 py-0.5 text-xs font-medium text-white/80'}>
								{GAME_GENRES[genre]?.name ?? genre}
							</span>
						))}
						{likeCount > 0 && (
							<span className={'flex items-center gap-1 text-xs text-liked'}>
								<Heart className={'size-3 fill-current'} aria-hidden={'true'} />
								{formatLikeCount(likeCount)}
							</span>
						)}
					</div>
				</div>
			</div>
		</div>
	)

	const spanClasses = 'col-span-3 row-span-2 sm:col-span-2 md:col-span-3 lg:col-span-3 xl:col-span-4 2xl:col-span-5'

	if (!href) {
		return <div className={spanClasses}>{inner}</div>
	}

	return (
		<Link
			href={href}
			className={`${spanClasses} rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary`}>
			{inner}
		</Link>
	)
}

// ---------------------------------------------------------------------------
// Per-section component
// ---------------------------------------------------------------------------

const GRID_CLASSES = 'grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10'

function SkeletonCard() {
	return (
		<div aria-hidden={'true'}>
			<Skeleton className={'aspect-[2.25/3] w-full rounded-sm'} />
			<div className={'mt-1.5 space-y-1 px-0.5'}>
				<Skeleton className={'h-3.5 w-3/4 rounded-sm'} />
				<Skeleton className={'h-3 w-1/2 rounded-sm'} />
				<Skeleton className={'mt-0.5 h-3 w-2/3 rounded-sm'} />
				<Skeleton className={'h-3 w-1/3 rounded-sm'} />
			</div>
		</div>
	)
}

function UpcomingSection({
	config,
	initialGames,
	isActivated,
	allLoadedFromSSR,
	now,
}: {
	config: SectionConfig
	initialGames: GameFeedGame[]
	isActivated: boolean
	allLoadedFromSSR: boolean
	now: string
}) {
	const [games, setGames] = useState(initialGames)
	const [hasMore, setHasMore] = useState(!allLoadedFromSSR)
	const [hasLoadedOnce, setHasLoadedOnce] = useState(initialGames.length > 0)
	const [totalCount, setTotalCount] = useState<number | null>(null)
	const [headlinerGame, setHeadlinerGame] = useState<GameFeedGame | null>(null)

	const isWeeklySection = config.key === 'this-week' || config.key === 'next-week'

	const [sentinelEl, setSentinelEl] = useState<HTMLDivElement | null>(null)
	const cursorRef = useRef<string | undefined>(
		initialGames.length > 0 ? String(initialGames.length) : undefined,
	)
	const isLoadingRef = useRef(false)
	const hasMoreRef = useRef(!allLoadedFromSSR)

	const loadMore = useCallback(async () => {
		if (isLoadingRef.current || !hasMoreRef.current) return
		isLoadingRef.current = true

		try {
			const result = await API.getUpcomingReleases(
				SECTION_FETCH_LIMIT,
				cursorRef.current ?? '0',
				now,
				false,
				config.from,
				config.to,
			)

			if (result.totalCount !== undefined) {
				setTotalCount(result.totalCount)
			}

			if (result.feed.length > 0) {
				setGames((prev) => {
					const existingUris = new Set(prev.map((g) => g.uri))
					const fresh = result.feed.filter((g) => !existingUris.has(g.uri))
					return [...prev, ...fresh]
				})
			}

			cursorRef.current = result.cursor
			if (!result.cursor) {
				hasMoreRef.current = false
				setHasMore(false)
			}
			setHasLoadedOnce(true)
		} finally {
			isLoadingRef.current = false
		}
	}, [now, config.from, config.to])

	const loadMoreRef = useRef(loadMore)
	loadMoreRef.current = loadMore

	// Auto-load first batch when activated and empty
	useEffect(() => {
		if (isActivated && games.length === 0 && hasMoreRef.current && !isLoadingRef.current) {
			loadMoreRef.current()
		}
	}, [isActivated, games.length])

	// Infinite scroll sentinel — uses callback ref so the observer
	// is created when the sentinel element first mounts in the DOM
	useEffect(() => {
		if (!isActivated || !hasMore || !sentinelEl) return

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) loadMoreRef.current()
			},
			{ rootMargin: '800px' },
		)

		observer.observe(sentinelEl)
		return () => observer.disconnect()
	}, [isActivated, hasMore, sentinelEl])

	useEffect(() => {
		if (headlinerGame || isWeeklySection || games.length === 0) return
		const pick = pickHeadlinerGame(games)
		if (pick) setHeadlinerGame(pick)
	}, [games, headlinerGame, isWeeklySection])

	const gridGames = headlinerGame
		? games.filter((g) => g.uri !== headlinerGame.uri)
		: games

	const isEmpty = (totalCount === 0) || (hasLoadedOnce && !hasMore && games.length === 0)
	const skeletonCount = totalCount !== null ? Math.max(0, totalCount - games.length) : 0

	return (
		<section
			id={sectionId(config.key)}
			data-section-key={config.key}
			className={'scroll-mt-32'}>
			<h2 className={'mb-4 font-[family-name:var(--font-cartridge)] text-xl font-black md:text-2xl'}>
				{config.label}
			</h2>

			{(headlinerGame || gridGames.length > 0) && (
				<div className={GRID_CLASSES}>
					{headlinerGame && <SectionHeadliner game={headlinerGame} />}
					{gridGames.map((game) => (
						<UpcomingGameCard key={game.uri} game={game} />
					))}
				</div>
			)}

			{hasMore && (
				<div ref={setSentinelEl} className={'h-1'} />
			)}

			{skeletonCount > 0 && (
				<div className={GRID_CLASSES} aria-hidden={'true'}>
					{Array.from({ length: skeletonCount }, (_, i) => (
						<SkeletonCard key={i} />
					))}
				</div>
			)}

			{isEmpty && (
				<p className={'py-4 text-sm text-muted-foreground'}>
					{'No releases in this period.'}
				</p>
			)}
		</section>
	)
}

// ---------------------------------------------------------------------------
// Main content
// ---------------------------------------------------------------------------

export function UpcomingReleasesContent(props: Props) {
	const { initialGames, initialCursor, now } = props

	const sections = useMemo(() => buildSectionConfigs(now), [now])

	const initialBySection = useMemo(
		() => distributeInitialGames(initialGames, sections),
		[initialGames, sections],
	)

	const allLoadedFromSSR = !initialCursor

	// Activation set: sections that have been scrolled to (or are eager).
	// Once activated, a section stays active and loads via infinite scroll.
	const [activatedKeys, setActivatedKeys] = useState<Set<string>>(() => {
		const eager = new Set<string>()
		eager.add('this-week')
		eager.add('next-week')
		// Also activate any section that received SSR data
		for (const [key] of initialBySection) {
			eager.add(key)
		}
		return eager
	})

	const scrollTargetIndexRef = useRef<number | null>(null)

	const sectionKeyToIndex = useMemo(() => {
		const map = new Map<string, number>()
		for (let i = 0; i < sections.length; i++) {
			map.set(sections[i]!.key, i)
		}
		return map
	}, [sections])

	const navItems = useMemo<SectionNavItem[]>(
		() => sections.map((s) => ({ id: sectionId(s.key), label: s.label })),
		[sections],
	)

	// Nav click: activate the target section, record its index so IO
	// skips intermediate sections during the smooth scroll
	const handleNavItemClick = useCallback((id: string) => {
		const key = id.replace('upcoming-', '')
		const idx = sectionKeyToIndex.get(key)
		if (idx !== undefined) scrollTargetIndexRef.current = idx

		setActivatedKeys((prev) => {
			if (prev.has(key)) return prev
			const next = new Set(prev)
			next.add(key)
			return next
		})
	}, [sectionKeyToIndex])

	// IO: activate sections as they approach the viewport during natural scroll.
	// During a nav-click scroll, only activate sections at or after the target.
	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				const targetIdx = scrollTargetIndexRef.current

				const newKeys: string[] = []
				for (const entry of entries) {
					if (!entry.isIntersecting) continue
					const key = entry.target.getAttribute('data-section-key')
					if (!key) continue

					if (targetIdx !== null) {
						const idx = sectionKeyToIndex.get(key)
						if (idx !== undefined && idx < targetIdx) continue
						if (idx === targetIdx) scrollTargetIndexRef.current = null
					}

					newKeys.push(key)
				}

				if (newKeys.length > 0) {
					setActivatedKeys((prev) => {
						let changed = false
						for (const key of newKeys) {
							if (!prev.has(key)) { changed = true; break }
						}
						if (!changed) return prev
						const next = new Set(prev)
						for (const key of newKeys) next.add(key)
						return next
					})
				}
			},
			{ rootMargin: '0px 0px 200px 0px', threshold: 0 },
		)

		for (const section of sections) {
			const el = document.getElementById(sectionId(section.key))
			if (el) observer.observe(el)
		}

		return () => observer.disconnect()
	}, [sections, sectionKeyToIndex])

	if (initialGames.length === 0 && !initialCursor) {
		return (
			<div className={'flex flex-col items-center gap-3 px-4 py-16 md:px-10 lg:px-16'}>
				<p className={'text-muted-foreground'}>
					{'No upcoming releases found.'}
				</p>
				<p className={'text-sm text-muted-foreground'}>
					{'Know a game that should be listed? '}
					<Link href={'/search'} className={'text-primary hover:underline'}>
						{'Search for it'}
					</Link>
					{' or suggest an addition.'}
				</p>
			</div>
		)
	}

	return (
		<>
			<SectionNav
				items={navItems}
				ariaLabel={'Upcoming release periods'}
				onItemClick={handleNavItemClick}
			/>

			<div className={'flex flex-col gap-12 px-4 pt-6 pb-16 md:px-10 lg:px-16'}>
				{sections.map((section) => (
					<UpcomingSection
						key={section.key}
						config={section}
						initialGames={initialBySection.get(section.key) ?? []}
						isActivated={activatedKeys.has(section.key)}
						allLoadedFromSSR={allLoadedFromSSR}
						now={now}
					/>
				))}
			</div>
		</>
	)
}
