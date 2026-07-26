'use client'

// Module imports
import { BarChart3, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useStore } from 'statery'

// Local imports
import * as API from '@/helpers/API'
import {
	type AnalyticsRange,
} from '@/helpers/analytics/constants'
import { Container } from '@/components/Container/Container'
import { DashboardHeader } from '@/components/DashboardHeader/DashboardHeader'
import { type GameAnalyticsSummary } from '@/helpers/analytics/types'
import { RangeSelector } from '@/components/AnalyticsDashboard/RangeSelector'
import { Skeleton } from '@/components/ui/skeleton'
import { Sparkline } from '@/components/AnalyticsDashboard/charts/Sparkline'
import { store } from '@/store/store'
import {
	formatCompact,
	formatCtr,
	formatDuration,
} from '@/components/AnalyticsDashboard/formatDuration'

// Constants
const BREADCRUMBS = [{ label: 'Analytics', url: '/dashboard/analytics' }]
const COLUMN_CLASS =
	'grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 sm:grid-cols-[minmax(0,1.6fr)_repeat(4,minmax(0,1fr))_auto]'

type Props = Readonly<{
	/** Injected in tests; production reads from the API. */
	games?: GameAnalyticsSummary[] | null
}>

function HeaderRow() {
	return (
		<div
			className={`${COLUMN_CLASS} hidden border-b border-border px-4 py-2.5 text-xs font-medium text-muted-foreground sm:grid`}>
			<span>{'Game'}</span>
			<span className={'text-right'}>{'Impressions'}</span>
			<span className={'text-right'}>{'Pageviews'}</span>
			<span className={'text-right'}>{'CTR'}</span>
			<span className={'text-right'}>{'Avg dwell'}</span>
			<span className={'sr-only'}>{'Trend'}</span>
		</div>
	)
}

function GameRow({ game }: { game: GameAnalyticsSummary }) {
	return (
		<Link
			href={`/dashboard/analytics/${game.slug}`}
			className={`${COLUMN_CLASS} group px-4 py-3 transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none`}>
			<span className={'flex items-center gap-2 truncate font-medium'}>
				<span className={'truncate'}>{game.name}</span>
			</span>

			<span className={'order-last text-right tabular-nums sm:order-none'}>
				<span className={'text-muted-foreground sm:hidden'}>{'Impr. '}</span>
				{formatCompact(game.impressions)}
			</span>

			<span className={'hidden text-right tabular-nums sm:inline'}>
				{formatCompact(game.pageviews)}
			</span>

			<span className={'hidden text-right tabular-nums sm:inline'}>
				{formatCtr(game.ctr)}
			</span>

			<span className={'hidden text-right tabular-nums sm:inline'}>
				{formatDuration(game.avgDwellMs)}
			</span>

			<span className={'flex items-center justify-end gap-1'}>
				<Sparkline
					points={game.sparkline}
					label={`Pageviews trend for ${game.name}`}
				/>
				<ChevronRight
					className={
						'size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100'
					}
					aria-hidden={'true'}
				/>
			</span>
		</Link>
	)
}

function LoadingRows() {
	return (
		<div className={'flex flex-col divide-y divide-border'}>
			{Array.from({ length: 4 }).map((_, index) => (
				<div key={index} className={'flex items-center gap-4 px-4 py-3.5'}>
					<Skeleton className={'h-4 flex-1'} />
					<Skeleton className={'h-4 w-12'} />
					<Skeleton className={'h-7 w-24'} />
				</div>
			))}
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
 * Analytics overview: a global time-range selector over a ranked table of every
 * game the caller owns, sorted by impressions (desc). Each row links to the
 * per-game breakdown. Fetches client-side, matching the rest of the dashboard.
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

	const loadData = useCallback(async () => {
		if (isControlled || !user) {
			return
		}

		setIsLoading(true)

		try {
			const result = await API.listMyGamesAnalytics(range)
			setGames(result.games)
		} catch {
			setGames([])
		} finally {
			setIsLoading(false)
		}
	}, [isControlled, range, user])

	useEffect(() => {
		loadData()
	}, [loadData])

	const sortedGames = useMemo(() => {
		if (!games) {
			return null
		}

		return [...games].sort((a, b) => b.impressions - a.impressions)
	}, [games])

	if (!isControlled && !user) {
		return (
			<>
				<DashboardHeader breadcrumbs={BREADCRUMBS} />
				<Container>
					<div className={'flex flex-col items-center gap-4 py-16 text-center'}>
						<p className={'text-muted-foreground'}>
							{'You must be signed in to view your analytics.'}
						</p>
					</div>
				</Container>
			</>
		)
	}

	return (
		<>
			<DashboardHeader breadcrumbs={BREADCRUMBS} />

			<Container>
				<div className={'flex flex-col gap-6'}>
					<div className={'flex flex-wrap items-center justify-between gap-3'}>
						<div className={'flex flex-col gap-0.5'}>
							<h1 className={'text-lg font-semibold'}>{'Analytics'}</h1>
							<p className={'text-sm text-muted-foreground'}>
								{'Performance across every game you own.'}
							</p>
						</div>

						<RangeSelector
							range={range}
							onRangeChange={setRange}
							disabled={isLoading}
						/>
					</div>

					<div
						className={'overflow-hidden rounded-xl border border-border bg-card'}
						aria-live={'polite'}>
						{isLoading || !sortedGames ? (
							<LoadingRows />
						) : sortedGames.length === 0 ? (
							<EmptyState />
						) : (
							<>
								<HeaderRow />
								<div className={'flex flex-col divide-y divide-border'}>
									{sortedGames.map((game) => (
										<GameRow key={game.slug} game={game} />
									))}
								</div>
							</>
						)}
					</div>
				</div>
			</Container>
		</>
	)
}
