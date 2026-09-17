'use client'

// Module imports
import { BarChart3, Search } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useStore } from 'statery'

// Local imports
import * as API from '@/helpers/API'
import { aggregateCatalog } from '@/helpers/analytics/aggregate'
import { type AnalyticsRange } from '@/helpers/analytics/constants'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/Container/Container'
import {
	formatCompact,
	formatCtr,
	NO_VALUE,
} from '@/components/AnalyticsDashboard/formatDuration'
import { type GameAnalyticsSummary } from '@/helpers/analytics/types'
import {
	GameMetricsTable,
	type GameMetricsSortKey,
} from '@/components/AnalyticsDashboard/GameMetricsTable'
import { Input } from '@/components/ui/input'
import { RangeSelector } from '@/components/AnalyticsDashboard/RangeSelector'
import { Skeleton } from '@/components/ui/skeleton'
import { store } from '@/store/store'
import { StudioPageHeader } from '@/components/StudioShell/StudioPageHeader'

// Constants
/** Text columns read best ascending; magnitudes read best largest-first. */
const DEFAULT_DIRECTIONS: Record<GameMetricsSortKey, 'asc' | 'desc'> = {
	name: 'asc',
	impressions: 'desc',
	pageviews: 'desc',
	ctr: 'desc',
	avgDwellMs: 'desc',
}

/** Filtering only earns its keyboard cost once a catalog is hard to scan. */
const FILTER_THRESHOLD = 8

type Props = Readonly<{
	/** Injected in tests; production reads from the API. */
	games?: GameAnalyticsSummary[] | null
}>

function compareGames(
	a: GameAnalyticsSummary,
	b: GameAnalyticsSummary,
	key: GameMetricsSortKey,
): number {
	if (key === 'name') {
		return a.name.localeCompare(b.name)
	}

	return (a[key] ?? 0) - (b[key] ?? 0)
}

function LoadingRows() {
	return (
		<div className={'overflow-hidden rounded-xl border border-border bg-card'}>
			<div className={'flex flex-col divide-y divide-border'}>
				{Array.from({ length: 6 }).map((_, index) => (
					<div key={index} className={'flex items-center gap-4 px-4 py-3.5'}>
						<Skeleton className={'h-4 flex-1'} />
						<Skeleton className={'h-4 w-12'} />
						<Skeleton className={'h-7 w-24'} />
					</div>
				))}
			</div>
		</div>
	)
}

function EmptyState() {
	return (
		<div
			className={
				'flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card/50 px-6 py-16 text-center'
			}>
			<BarChart3 className={'size-6 text-muted-foreground/60'} aria-hidden={'true'} />

			<div className={'flex flex-col gap-1'}>
				<p className={'text-sm font-medium'}>{'No analytics yet'}</p>

				<p className={'max-w-sm text-xs text-muted-foreground'}>
					{'Data starts collecting once tracking is live. Once your games are surfaced to players, their performance shows up here.'}
				</p>
			</div>
		</div>
	)
}

/**
 * Every owned game, sortable by any metric.
 *
 * This is the depth behind the studio overview: the overview answers "how is
 * the catalog doing" with a top slice, and this answers "which game is doing
 * what" across all of them. Each row still drills into the per-game breakdown.
 */
export function AnalyticsOverview(props: Props) {
	const { games: injectedGames } = props
	const isControlled = injectedGames !== undefined

	const { user } = useStore(store)

	const [range, setRange] = useState<AnalyticsRange>('30d')
	const [games, setGames] = useState<GameAnalyticsSummary[] | null>(
		injectedGames ?? null,
	)
	const [isLoading, setIsLoading] = useState(!isControlled)
	const [hasError, setHasError] = useState(false)
	const [filter, setFilter] = useState('')
	const [sortKey, setSortKey] = useState<GameMetricsSortKey>('impressions')
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

	const loadData = useCallback(async () => {
		if (isControlled || !user) {
			return
		}

		setIsLoading(true)

		try {
			const result = await API.listMyGamesAnalytics(range)
			setGames(result.games)
			setHasError(false)
		} catch {
			setHasError(true)
		} finally {
			setIsLoading(false)
		}
	}, [isControlled, range, user])

	useEffect(() => {
		loadData()
	}, [loadData])

	const handleSortChange = useCallback(
		(key: GameMetricsSortKey) => {
			if (key === sortKey) {
				setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))
				return
			}

			setSortKey(key)
			setSortDirection(DEFAULT_DIRECTIONS[key])
		},
		[sortKey],
	)

	const handleFilterChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			setFilter(event.target.value)
		},
		[],
	)

	const totals = useMemo(() => aggregateCatalog(games), [games])

	const visibleGames = useMemo(() => {
		if (!games) {
			return []
		}

		const needle = filter.trim().toLowerCase()

		const filtered = needle
			? games.filter((game) => game.name.toLowerCase().includes(needle))
			: games

		const sorted = [...filtered].sort((a, b) => compareGames(a, b, sortKey))

		return sortDirection === 'desc' ? sorted.reverse() : sorted
	}, [filter, games, sortDirection, sortKey])

	if (!isControlled && !user) {
		return (
			<Container>
				<div className={'flex flex-col items-center gap-4 py-16 text-center'}>
					<p className={'text-muted-foreground'}>
						{'You must be signed in to view your analytics.'}
					</p>
				</div>
			</Container>
		)
	}

	const hasGames = Boolean(games && games.length > 0)
	const isFirstLoad = isLoading && !games

	return (
		<Container>
			<div className={'flex flex-col gap-6'}>
				<StudioPageHeader
					title={'Analytics'}
					description={
						hasGames
							? `${totals.games} ${totals.games === 1 ? 'game' : 'games'} · ${formatCompact(totals.impressions)} impressions · ${formatCompact(totals.pageviews)} pageviews · ${totals.impressions > 0 ? formatCtr(totals.ctr) : NO_VALUE} CTR`
							: 'Performance across every game you own.'
					}
					actions={
						<RangeSelector
							range={range}
							onRangeChange={setRange}
							disabled={isLoading}
						/>
					}
				/>

				{hasError && (
					<div
						role={'alert'}
						className={
							'flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3'
						}>
						<p className={'text-sm'}>
							{games
								? 'Couldn’t refresh your analytics. Showing your last successful load.'
								: 'Couldn’t load your analytics.'}
						</p>

						<Button
							onClick={loadData}
							size={'sm'}
							variant={'outline'}>
							{'Try again'}
						</Button>
					</div>
				)}

				{hasGames && (games?.length ?? 0) >= FILTER_THRESHOLD && (
					<div className={'relative max-w-xs'}>
						<Search
							aria-hidden={'true'}
							className={
								'pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground'
							}
						/>

						<Input
							type={'search'}
							value={filter}
							onChange={handleFilterChange}
							placeholder={'Filter games'}
							aria-label={'Filter games by name'}
							className={'pl-9'}
						/>
					</div>
				)}

				<div aria-live={'polite'}>
					{isFirstLoad ? (
						<LoadingRows />
					) : !hasGames ? (
						<EmptyState />
					) : visibleGames.length === 0 ? (
						<div
							className={
								'flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card/50 px-6 py-12 text-center'
							}>
							<p className={'text-sm text-muted-foreground'}>
								{`No games match “${filter.trim()}”.`}
							</p>

							<Button
								onClick={() => setFilter('')}
								size={'sm'}
								variant={'outline'}>
								{'Clear filter'}
							</Button>
						</div>
					) : (
						<GameMetricsTable
							games={visibleGames}
							sort={{
								key: sortKey,
								direction: sortDirection,
								onSortChange: handleSortChange,
							}}
						/>
					)}
				</div>
			</div>
		</Container>
	)
}
