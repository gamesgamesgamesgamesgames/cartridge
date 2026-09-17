'use client'

// Module imports
import { ArrowRight, Eye, MousePointerClick, Plus, Timer, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useStore } from 'statery'

// Local imports
import * as API from '@/helpers/API'
import {
	aggregateCatalog,
	catalogPageviewSeries,
	periodDelta,
} from '@/helpers/analytics/aggregate'
import {
	ANALYTICS_RANGE_DAYS,
	type AnalyticsRange,
} from '@/helpers/analytics/constants'
import { AnalyticsStatTiles, type StatTile } from '@/components/AnalyticsDashboard/AnalyticsStatTiles'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/Container/Container'
import { DeltaIndicator } from '@/components/AnalyticsDashboard/DeltaIndicator'
import {
	formatCompact,
	formatCtr,
	formatDuration,
	formatFull,
	NO_VALUE,
} from '@/components/AnalyticsDashboard/formatDuration'
import { type GameAnalyticsSummary } from '@/helpers/analytics/types'
import { GameMetricsTable } from '@/components/AnalyticsDashboard/GameMetricsTable'
import { PageviewsAreaChart } from '@/components/AnalyticsDashboard/charts/PageviewsAreaChart'
import { RangeSelector } from '@/components/AnalyticsDashboard/RangeSelector'
import { Skeleton } from '@/components/ui/skeleton'
import { store } from '@/store/store'
import { StudioAttentionRail } from '@/components/StudioOverview/StudioAttentionRail'
import { StudioPageHeader } from '@/components/StudioShell/StudioPageHeader'

// Constants
/** How many games the overview ranks before deferring to the full table. */
const TOP_GAMES = 5

const RANGE_LABELS: Record<AnalyticsRange, string> = {
	'7d': 'last 7 days',
	'30d': 'last 30 days',
	'90d': 'last 90 days',
}

type Props = Readonly<{
	/** Injected in tests; production reads from the API. */
	games?: GameAnalyticsSummary[] | null
}>

function LoadingState() {
	return (
		<div className={'flex flex-col gap-8'}>
			<div className={'grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4'}>
				{Array.from({ length: 4 }).map((_, index) => (
					<Skeleton key={index} className={'h-[104px] rounded-lg'} />
				))}
			</div>

			<div className={'grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-6'}>
				<Skeleton className={'h-[300px] rounded-xl'} />
				<Skeleton className={'h-[300px] rounded-xl'} />
			</div>

			<Skeleton className={'h-[260px] rounded-xl'} />
		</div>
	)
}

/** No games at all — the studio hasn't started. Teaches both ways in. */
function NoGamesState() {
	return (
		<div
			className={
				'flex flex-col items-center gap-4 rounded-xl border border-dashed border-border bg-card/50 px-6 py-14 text-center'
			}>
			<div className={'flex max-w-sm flex-col gap-1.5'}>
				<p className={'text-base font-semibold'}>{'No games yet'}</p>
				<p className={'text-sm text-muted-foreground'}>
					{'Add a game to put it on Cartridge, or claim one that’s already here so you can manage its page.'}
				</p>
			</div>

			<div className={'flex flex-wrap items-center justify-center gap-2'}>
				<Button asChild>
					<Link href={'/studio/catalog/new-game'}>
						<Plus className={'size-4'} />
						{'Add a game'}
					</Link>
				</Button>

				<Button
					asChild
					variant={'outline'}>
					<Link href={'/claim'}>{'Claim existing games'}</Link>
				</Button>
			</div>
		</div>
	)
}

/**
 * The studio's front page: how the catalog is performing, then what's waiting.
 *
 * Everything here is derived from a single `listMyGamesAnalytics` call —
 * catalog totals, the daily series, and the ranking all come out of the same
 * payload, so the page has one loading state and one failure mode rather than
 * four racing panels.
 */
export function StudioOverview(props: Props) {
	const { games: injectedGames } = props
	const isControlled = injectedGames !== undefined

	const { user } = useStore(store)

	const [range, setRange] = useState<AnalyticsRange>('30d')
	const [games, setGames] = useState<GameAnalyticsSummary[] | null>(
		injectedGames ?? null,
	)
	const [isLoading, setIsLoading] = useState(!isControlled)
	const [hasError, setHasError] = useState(false)

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
			// Leave whatever's on screen in place — a stale number the user can
			// see beats an empty page they can't do anything with.
			setHasError(true)
		} finally {
			setIsLoading(false)
		}
	}, [isControlled, range, user])

	useEffect(() => {
		loadData()
	}, [loadData])

	const totals = useMemo(() => aggregateCatalog(games), [games])

	const series = useMemo(() => catalogPageviewSeries(games), [games])

	const delta = useMemo(() => periodDelta(series), [series])

	const rankedGames = useMemo(() => {
		if (!games) {
			return []
		}

		return [...games].sort((a, b) => b.impressions - a.impressions)
	}, [games])

	const comparisonLabel = useMemo(() => {
		// The delta splits the range in half, so name that half rather than the
		// whole range — "vs previous 30 days" would be wrong for a 30d view.
		const halfDays = Math.floor(ANALYTICS_RANGE_DAYS[range] / 2)
		return `previous ${halfDays} days`
	}, [range])

	const tiles = useMemo<StatTile[]>(() => {
		const clicks = Math.round(totals.ctr * totals.impressions)

		return [
			{
				label: 'Impressions',
				value: formatCompact(totals.impressions),
				icon: Eye,
				hint: totals.games > 0
					? `across ${totals.games} ${totals.games === 1 ? 'game' : 'games'}`
					: undefined,
			},
			{
				label: 'Pageviews',
				value: formatCompact(totals.pageviews),
				icon: TrendingUp,
				hint: (
					<DeltaIndicator
						delta={delta}
						comparisonLabel={comparisonLabel}
					/>
				),
			},
			{
				label: 'CTR',
				value: totals.impressions > 0 ? formatCtr(totals.ctr) : NO_VALUE,
				icon: MousePointerClick,
				hint: totals.impressions > 0
					? `${formatFull(clicks)} ${clicks === 1 ? 'click' : 'clicks'}`
					: undefined,
			},
			{
				label: 'Avg dwell',
				value: totals.pageviews > 0 ? formatDuration(totals.avgDwellMs) : NO_VALUE,
				icon: Timer,
				hint: totals.pageviews > 0 ? 'per pageview' : undefined,
			},
		]
	}, [comparisonLabel, delta, totals])

	if (!isControlled && !user) {
		return (
			<Container>
				<div className={'flex flex-col items-center gap-4 py-16 text-center'}>
					<p className={'text-muted-foreground'}>
						{'You must be signed in to view your studio.'}
					</p>

					<Button asChild>
						<Link href={'/login?returnTo=%2Fstudio'}>{'Log in'}</Link>
					</Button>
				</div>
			</Container>
		)
	}

	const hasGames = Boolean(games && games.length > 0)
	const hasTraffic = totals.impressions > 0 || totals.pageviews > 0
	const isFirstLoad = isLoading && !games

	return (
		<Container>
			<div className={'flex flex-col gap-8'}>
				<StudioPageHeader
					title={'Studio'}
					description={
						hasGames
							? `How your catalog is performing over the ${RANGE_LABELS[range]}.`
							: 'Your games, your numbers, and anything waiting on you.'
					}
					actions={
						hasGames ? (
							<RangeSelector
								range={range}
								onRangeChange={setRange}
								disabled={isLoading}
							/>
						) : undefined
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
								? 'Couldn’t refresh your analytics. The numbers below are from your last successful load.'
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

				{isFirstLoad ? (
					<LoadingState />
				) : !hasGames ? (
					<div className={'grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-6'}>
						<NoGamesState />
						<StudioAttentionRail />
					</div>
				) : (
					<>
						<div aria-live={'polite'}>
							<AnalyticsStatTiles tiles={tiles} />
						</div>

						<div className={'grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-6'}>
							<section
								aria-labelledby={'studio-pageviews-heading'}
								className={
									'flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:p-5'
								}>
								<div className={'flex flex-col gap-0.5'}>
									<h2
										id={'studio-pageviews-heading'}
										className={'text-sm font-semibold'}>
										{'Pageviews'}
									</h2>

									<p className={'text-xs text-muted-foreground'}>
										{`Across every game you own, ${RANGE_LABELS[range]}.`}
									</p>
								</div>

								{hasTraffic && series.length > 1 ? (
									<PageviewsAreaChart data={series} />
								) : (
									<p
										className={
											'flex h-[220px] items-center justify-center px-6 text-center text-sm text-muted-foreground'
										}>
										{'Not enough activity in this range to chart yet.'}
									</p>
								)}
							</section>

							<StudioAttentionRail />
						</div>

						<section
							aria-labelledby={'studio-top-games-heading'}
							className={'flex flex-col gap-3'}>
							<div className={'flex items-end justify-between gap-4'}>
								<div className={'flex flex-col gap-0.5'}>
									<h2
										id={'studio-top-games-heading'}
										className={'text-sm font-semibold'}>
										{rankedGames.length > TOP_GAMES ? 'Top games' : 'Your games'}
									</h2>

									<p className={'text-xs text-muted-foreground'}>
										{'Ranked by impressions.'}
									</p>
								</div>

								{rankedGames.length > TOP_GAMES && (
									<Button
										asChild
										size={'sm'}
										variant={'ghost'}
										className={'shrink-0'}>
										<Link href={'/studio/analytics'}>
											{`All ${rankedGames.length} games`}
											<ArrowRight className={'size-3.5'} />
										</Link>
									</Button>
								)}
							</div>

							<GameMetricsTable games={rankedGames.slice(0, TOP_GAMES)} />

							{!hasTraffic && (
								<p className={'text-xs text-muted-foreground'}>
									{'No impressions recorded in this range yet. Numbers appear once players start seeing your games in search and feeds.'}
								</p>
							)}
						</section>
					</>
				)}
			</div>
		</Container>
	)
}
