// Module imports
import {
	Eye,
	MousePointerClick,
	ScrollText,
	Timer,
	TrendingUp,
	Users,
} from 'lucide-react'

// Local imports
import {
	AnalyticsStatTiles,
	type StatTile,
} from '@/components/AnalyticsDashboard/AnalyticsStatTiles'
import { CtrBySurfaceTable } from '@/components/AnalyticsDashboard/CtrBySurfaceTable'
import { DailyUniquesLine } from '@/components/AnalyticsDashboard/charts/DailyUniquesLine'
import { Funnel } from '@/components/AnalyticsDashboard/Funnel'
import { type GameAnalytics } from '@/helpers/analytics/types'
import { HorizontalBars } from '@/components/AnalyticsDashboard/charts/HorizontalBars'
import { ImpressionsAreaChart } from '@/components/AnalyticsDashboard/charts/ImpressionsAreaChart'
import { Panel } from '@/components/AnalyticsDashboard/Panel'
import { RankedList } from '@/components/AnalyticsDashboard/RankedList'
import { RecordTrendsLine } from '@/components/AnalyticsDashboard/charts/RecordTrendsLine'
import {
	formatCompact,
	formatCtr,
	formatDuration,
} from '@/components/AnalyticsDashboard/formatDuration'
import { feedLabel, sourceLabel } from '@/components/AnalyticsDashboard/feedLabels'
import { SERIES_COLORS } from '@/components/AnalyticsDashboard/chartPalette'

type Props = Readonly<{
	analytics: GameAnalytics | null
}>

/** True when there's no meaningful behavioral data to show. */
function isEmpty(analytics: GameAnalytics): boolean {
	const { impressions, clicks, pageviews } = analytics.totals
	return impressions === 0 && clicks === 0 && pageviews === 0
}

/** Color a referrer/source name by its stable per-entity assignment. */
function sourceColor(name: string): string {
	return (
		SERIES_COLORS[name as keyof typeof SERIES_COLORS] ?? SERIES_COLORS.primary
	)
}

function EmptyState() {
	return (
		<div
			className={
				'flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card/50 px-6 py-16 text-center'
			}>
			<TrendingUp className={'size-6 text-muted-foreground/60'} aria-hidden={'true'} />
			<div className={'flex flex-col gap-1'}>
				<p className={'text-sm font-medium'}>{'No analytics yet'}</p>
				<p className={'max-w-sm text-xs text-muted-foreground'}>
					{'Data starts collecting once tracking is live. Check back after your game has been surfaced to players.'}
				</p>
			</div>
		</div>
	)
}

/**
 * The full per-game analytics view: a headline stat-tile row plus four titled
 * panels (discovery, attribution, engagement, conversions). Presentational —
 * the route fetches the payload and passes it in.
 */
export function GameAnalyticsPanel(props: Props) {
	const { analytics } = props

	if (!analytics || isEmpty(analytics)) {
		return <EmptyState />
	}

	const { totals, discovery, attribution, engagement, conversions } = analytics

	const headlineTiles: StatTile[] = [
		{ label: 'Impressions', value: formatCompact(totals.impressions), icon: Eye },
		{ label: 'CTR', value: formatCtr(totals.ctr), icon: MousePointerClick },
		{ label: 'Pageviews', value: formatCompact(totals.pageviews), icon: TrendingUp },
		{ label: 'Avg dwell', value: formatDuration(totals.avgDwellMs), icon: Timer },
	]

	const engagementTiles: StatTile[] = [
		{ label: 'Avg dwell', value: formatDuration(totals.avgDwellMs), icon: Timer },
		{ label: 'Median dwell', value: formatDuration(totals.medianDwellMs), icon: Timer },
		{ label: 'Avg scroll', value: `${Math.round(totals.avgScrollPct)}%`, icon: ScrollText },
		{ label: 'Avg daily uniques', value: formatCompact(totals.avgDailyUniques), icon: Users },
	]

	return (
		<div className={'flex flex-col gap-6'}>
			<AnalyticsStatTiles tiles={headlineTiles} />

			{/* 1 — Discovery & visibility */}
			<Panel
				title={'Discovery & visibility'}
				description={'How players are finding this game.'}>
				<div className={'flex flex-col gap-2'}>
					<h3 className={'text-xs font-medium text-muted-foreground'}>
						{'Impressions over time'}
					</h3>
					<ImpressionsAreaChart data={discovery.impressionsOverTime} />
				</div>

				<div className={'grid gap-6 lg:grid-cols-2'}>
					<div className={'flex flex-col gap-2'}>
						<h3 className={'text-xs font-medium text-muted-foreground'}>
							{'Feeds surfacing this game'}
						</h3>
						<HorizontalBars
							data={discovery.feedBreakdown}
							labelFor={feedLabel}
							ariaLabel={'Impressions by feed'}
						/>
					</div>

					<div className={'flex flex-col gap-2'}>
						<h3 className={'text-xs font-medium text-muted-foreground'}>
							{'Top search terms'}
						</h3>
						<RankedList
							items={discovery.topSearchTerms}
							emptyLabel={'No search impressions yet'}
						/>
					</div>
				</div>
			</Panel>

			{/* 2 — Attribution */}
			<Panel
				title={'Attribution'}
				description={'Where pageviews are coming from.'}>
				<div className={'grid gap-6 lg:grid-cols-2'}>
					<div className={'flex flex-col gap-2'}>
						<h3 className={'text-xs font-medium text-muted-foreground'}>
							{'Traffic sources'}
						</h3>
						<HorizontalBars
							data={attribution.trafficSources}
							labelFor={sourceLabel}
							colorFor={sourceColor}
							ariaLabel={'Pageviews by traffic source'}
						/>
					</div>

					<div className={'flex flex-col gap-2'}>
						<h3 className={'text-xs font-medium text-muted-foreground'}>
							{'Top referrer feeds'}
						</h3>
						<RankedList
							items={attribution.topReferrerFeeds}
							labelFor={feedLabel}
							emptyLabel={'No feed referrals yet'}
						/>
					</div>
				</div>

				<div className={'flex flex-col gap-2'}>
					<h3 className={'text-xs font-medium text-muted-foreground'}>
						{'Click-through by surface'}
					</h3>
					<CtrBySurfaceTable rows={attribution.ctrBySurface} />
				</div>
			</Panel>

			{/* 3 — Engagement */}
			<Panel
				title={'Engagement'}
				description={'How players interact once they arrive.'}>
				<AnalyticsStatTiles tiles={engagementTiles} />

				<div className={'grid gap-6 lg:grid-cols-2'}>
					<div className={'flex flex-col gap-2'}>
						<h3 className={'text-xs font-medium text-muted-foreground'}>
							{'Dwell-time distribution'}
						</h3>
						<HorizontalBars
							data={engagement.dwellDistribution}
							ariaLabel={'Visitors by dwell-time bucket'}
						/>
					</div>

					<div className={'flex flex-col gap-2'}>
						<h3 className={'text-xs font-medium text-muted-foreground'}>
							{'Tab engagement'}
						</h3>
						<HorizontalBars
							data={engagement.tabEngagement}
							labelFor={feedLabel}
							ariaLabel={'Views by tab'}
						/>
					</div>
				</div>

				<div className={'flex flex-col gap-2'}>
					<h3 className={'text-xs font-medium text-muted-foreground'}>
						{'Unique visitors per day'}
					</h3>
					<DailyUniquesLine data={engagement.dailyUniques} />
					<p className={'text-xs text-muted-foreground/80'}>
						{'Unique per day; not comparable across days (privacy hashing rotates daily).'}
					</p>
				</div>
			</Panel>

			{/* 4 — Conversions & trends */}
			<Panel
				title={'Conversions & trends'}
				description={'Records created and the discovery-to-action funnel.'}>
				<div className={'flex flex-col gap-2'}>
					<h3 className={'text-xs font-medium text-muted-foreground'}>
						{'Record trends'}
					</h3>
					<RecordTrendsLine data={conversions.recordTrends} />
				</div>

				<div className={'flex flex-col gap-3'}>
					<h3 className={'text-xs font-medium text-muted-foreground'}>
						{'Discovery → engagement funnel'}
					</h3>
					<Funnel
						impressions={conversions.funnel.impressions}
						pageviews={conversions.funnel.pageviews}
						actions={conversions.funnel.actions}
					/>
				</div>
			</Panel>
		</div>
	)
}
