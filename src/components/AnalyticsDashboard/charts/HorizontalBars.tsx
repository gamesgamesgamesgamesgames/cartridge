'use client'

// Module imports
import {
	Bar,
	BarChart,
	Cell,
	LabelList,
	XAxis,
	YAxis,
} from 'recharts'

// Local imports
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	type ChartConfig,
} from '@/components/ui/chart'
import { type NamedCount } from '@/helpers/analytics/types'
import { formatCompact } from '@/components/AnalyticsDashboard/formatDuration'
import { SERIES_COLORS } from '@/components/AnalyticsDashboard/chartPalette'

// Constants
const ROW_HEIGHT = 34
const CHART_CONFIG = {
	count: { label: 'Count', color: SERIES_COLORS.primary },
} satisfies ChartConfig

type Row = NamedCount & { label: string; color: string }

type Props = Readonly<{
	data: NamedCount[]
	/** Friendly label for a raw `name`; defaults to the name itself. */
	labelFor?: (name: string) => string
	/** Per-entity color for a raw `name`; defaults to the Amber signal hue. */
	colorFor?: (name: string) => string
	/** Accessible name for the chart. */
	ariaLabel: string
}>

/**
 * Horizontal magnitude bars with direct value labels at each tip. Single-hue by
 * default (magnitude, not identity); pass `colorFor` to color by entity — in
 * which case the direct labels + tooltip provide the required secondary
 * encoding. Bars grow from a single baseline, ranked as supplied.
 */
export function HorizontalBars(props: Props) {
	const { data, labelFor, colorFor, ariaLabel } = props

	const rows: Row[] = data.map((item) => ({
		...item,
		label: labelFor ? labelFor(item.name) : item.name,
		color: colorFor ? colorFor(item.name) : SERIES_COLORS.primary,
	}))

	const height = Math.max(rows.length * ROW_HEIGHT + 8, ROW_HEIGHT)

	return (
		<ChartContainer
			config={CHART_CONFIG}
			className={'aspect-auto w-full'}
			style={{ height }}
			aria-label={ariaLabel}>
			<BarChart
				accessibilityLayer
				data={rows}
				layout={'vertical'}
				margin={{ left: 4, right: 40, top: 2, bottom: 2 }}>
				<YAxis
					dataKey={'label'}
					type={'category'}
					tickLine={false}
					axisLine={false}
					width={112}
					tickMargin={6}
				/>

				<XAxis dataKey={'count'} type={'number'} hide />

				<ChartTooltip
					cursor={false}
					content={<ChartTooltipContent hideIndicator />}
				/>

				<Bar dataKey={'count'} radius={[0, 4, 4, 0]} barSize={20}>
					{rows.map((row) => (
						<Cell key={row.name} fill={row.color} />
					))}

					<LabelList
						dataKey={'count'}
						position={'right'}
						offset={8}
						className={'fill-muted-foreground'}
						fontSize={12}
						formatter={(value: number) => formatCompact(value)}
					/>
				</Bar>
			</BarChart>
		</ChartContainer>
	)
}
