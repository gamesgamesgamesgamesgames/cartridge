'use client'

// Module imports
import { ArrowDown, ArrowUp, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { twMerge } from 'tailwind-merge'

// Local imports
import {
	formatCompact,
	formatCtr,
	formatDuration,
	NO_VALUE,
} from '@/components/AnalyticsDashboard/formatDuration'
import { type GameAnalyticsSummary } from '@/helpers/analytics/types'
import { Sparkline } from '@/components/AnalyticsDashboard/charts/Sparkline'

// Constants
/**
 * The header and each row are separate grid containers, so every track has to be
 * intrinsically sized the same in both or the columns drift apart. The trailing
 * trend cell is therefore a fixed width — 96px of sparkline + a 4px gap + a 16px
 * chevron — rather than `auto`, which would collapse to 0 in the header (whose
 * only content there is an out-of-flow `sr-only` label) while sizing to 116px in
 * the body, leaving the `fr` columns dividing different amounts of slack.
 */
const GRID_CLASS =
	'grid grid-cols-[minmax(0,1.6fr)_repeat(4,minmax(0,1fr))_116px] items-center gap-x-4'

export type GameMetricsSortKey =
	| 'name'
	| 'impressions'
	| 'pageviews'
	| 'ctr'
	| 'avgDwellMs'

export type GameMetricsSort = Readonly<{
	key: GameMetricsSortKey
	direction: 'asc' | 'desc'
	onSortChange: (key: GameMetricsSortKey) => void
}>

const COLUMNS = [
	{ key: 'name', label: 'Game', align: 'left' },
	{ key: 'impressions', label: 'Impressions', align: 'right' },
	{ key: 'pageviews', label: 'Pageviews', align: 'right' },
	{ key: 'ctr', label: 'CTR', align: 'right' },
	{ key: 'avgDwellMs', label: 'Avg dwell', align: 'right' },
] as const satisfies readonly {
	key: GameMetricsSortKey
	label: string
	align: 'left' | 'right'
}[]

type Props = Readonly<{
	games: GameAnalyticsSummary[]
	/** Omit for a static ranking; supply to make the headers sortable. */
	sort?: GameMetricsSort
}>

/** `CTR` reads as an initialism, so it gets spelled out for screen readers. */
function columnAccessibleLabel(key: GameMetricsSortKey, label: string): string {
	return key === 'ctr' ? 'Click-through rate' : label
}

function HeaderCell(
	props: Readonly<{
		column: (typeof COLUMNS)[number]
		sort?: GameMetricsSort
	}>,
) {
	const { column, sort } = props

	const isSorted = sort?.key === column.key
	const alignClass = column.align === 'right' ? 'justify-end text-right' : 'justify-start'

	if (!sort) {
		return (
			<span className={column.align === 'right' ? 'text-right' : undefined}>
				{column.label}
			</span>
		)
	}

	const Icon = sort.direction === 'asc' ? ArrowUp : ArrowDown

	// These rows are links, not table cells, so there's no `columnheader` to
	// hang `aria-sort` on. The state goes into the accessible name instead.
	const accessibleName = columnAccessibleLabel(column.key, column.label)
	const label = isSorted
		? `${accessibleName}, sorted ${sort.direction === 'asc' ? 'ascending' : 'descending'}. Activate to sort ${sort.direction === 'asc' ? 'descending' : 'ascending'}.`
		: `Sort by ${accessibleName}`

	return (
		<button
			type={'button'}
			onClick={() => sort.onSortChange(column.key)}
			aria-label={label}
			className={twMerge(
				'-mx-1 flex items-center gap-1 rounded px-1 py-1 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
				alignClass,
				isSorted && 'text-foreground',
			)}>
			{/* On right-aligned columns the arrow leads, so the label's right edge
			    still lands on the column edge — and therefore on its values. */}
			{isSorted && column.align === 'right' && <SortIcon Icon={Icon} />}

			{column.label}

			{isSorted && column.align !== 'right' && <SortIcon Icon={Icon} />}
		</button>
	)
}

function SortIcon(props: Readonly<{ Icon: typeof ArrowUp }>) {
	const { Icon } = props

	return (
		<Icon
			aria-hidden={'true'}
			className={'size-3 shrink-0 text-primary'}
		/>
	)
}

function MetricRow(props: Readonly<{ game: GameAnalyticsSummary }>) {
	const { game } = props

	// A rate with no impressions and a dwell with no pageviews are undefined,
	// not zero — see NO_VALUE.
	const ctr = game.impressions > 0 ? formatCtr(game.ctr) : NO_VALUE
	const dwell = game.pageviews > 0 ? formatDuration(game.avgDwellMs) : NO_VALUE

	return (
		<Link
			href={`/studio/analytics/${game.slug}`}
			className={
				'group block px-4 py-3 transition-colors duration-150 hover:bg-accent focus-visible:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring'
			}>
			{/* Narrow: the metrics collapse into one summary line rather than
			    dropping off the row entirely. */}
			<div className={'flex items-center gap-3 sm:hidden'}>
				{/* Two fixed lines rather than one wrapping line: wrapping a
				    separator-joined list strands a trailing "·" at the break. */}
				<div className={'flex min-w-0 flex-1 flex-col gap-0.5'}>
					<span className={'truncate text-sm font-medium'}>{game.name}</span>

					<span className={'truncate text-xs tabular-nums text-muted-foreground'}>
						{formatCompact(game.impressions)}
						{' impressions · '}
						{formatCompact(game.pageviews)}
						{' pageviews'}
					</span>

					<span className={'truncate text-xs tabular-nums text-muted-foreground'}>
						{ctr}
						{' CTR · '}
						{dwell}
						{' avg dwell'}
					</span>
				</div>

				<Sparkline
					points={game.sparkline}
					label={`Pageviews trend for ${game.name}`}
				/>
			</div>

			<div className={twMerge(GRID_CLASS, 'hidden sm:grid')}>
				<span className={'truncate text-sm font-medium'}>{game.name}</span>

				<span className={'text-right text-sm tabular-nums'}>
					{formatCompact(game.impressions)}
				</span>

				<span className={'text-right text-sm tabular-nums'}>
					{formatCompact(game.pageviews)}
				</span>

				<span className={'text-right text-sm tabular-nums'}>{ctr}</span>

				<span className={'text-right text-sm tabular-nums'}>{dwell}</span>

				<span className={'flex items-center justify-end gap-1'}>
					<Sparkline
						points={game.sparkline}
						label={`Pageviews trend for ${game.name}`}
					/>

					<ChevronRight
						aria-hidden={'true'}
						className={
							'size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100'
						}
					/>
				</span>
			</div>
		</Link>
	)
}

/**
 * The ranked list of a studio's games, shared by the overview's top slice and
 * the full analytics table so both read identically.
 *
 * Pass `sort` to make the headers interactive; without it the caller owns the
 * order and the headers are plain labels.
 */
export function GameMetricsTable(props: Props) {
	const { games, sort } = props

	return (
		<div className={'overflow-hidden rounded-xl border border-border bg-card'}>
			<div
				className={twMerge(
					GRID_CLASS,
					'hidden border-b border-border px-4 py-2.5 text-xs font-medium text-muted-foreground sm:grid',
				)}>
				{COLUMNS.map((column) => (
					<HeaderCell
						key={column.key}
						column={column}
						sort={sort}
					/>
				))}

				<span className={'sr-only'}>{'Trend'}</span>
			</div>

			<div className={'flex flex-col divide-y divide-border'}>
				{games.map((game) => (
					<MetricRow
						key={game.slug}
						game={game}
					/>
				))}
			</div>
		</div>
	)
}
