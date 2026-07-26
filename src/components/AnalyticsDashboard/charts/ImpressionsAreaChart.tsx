'use client'

// Module imports
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

// Local imports
import {
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
	type ChartConfig,
} from '@/components/ui/chart'
import { formatCompact } from '@/components/AnalyticsDashboard/formatDuration'
import { SERIES_COLORS } from '@/components/AnalyticsDashboard/chartPalette'
import { shortDate } from '@/components/AnalyticsDashboard/charts/shortDate'

// Constants
const CHART_CONFIG = {
	feed: { label: 'Feed', color: SERIES_COLORS.feed },
	search: { label: 'Search', color: SERIES_COLORS.search },
} satisfies ChartConfig

type Point = Readonly<{ date: string; search: number; feed: number }>

type Props = Readonly<{
	data: Point[]
}>

/**
 * Stacked area of impressions per day, split by discovery surface (feed vs
 * search). Two series → legend is always shown; the tooltip names each surface,
 * so identity never rests on hue alone.
 */
export function ImpressionsAreaChart(props: Props) {
	const { data } = props

	return (
		<ChartContainer
			config={CHART_CONFIG}
			className={'aspect-auto h-[240px] w-full'}>
			<AreaChart data={data} margin={{ left: 4, right: 8, top: 8 }}>
				<CartesianGrid vertical={false} stroke={'var(--border)'} />

				<XAxis
					dataKey={'date'}
					tickLine={false}
					axisLine={false}
					tickMargin={8}
					minTickGap={24}
					tickFormatter={shortDate}
				/>

				<YAxis
					tickLine={false}
					axisLine={false}
					width={36}
					tickFormatter={formatCompact}
				/>

				<ChartTooltip
					content={
						<ChartTooltipContent
							labelFormatter={(value) => shortDate(String(value))}
						/>
					}
				/>

				<defs>
					<linearGradient id={'fillFeed'} x1={'0'} y1={'0'} x2={'0'} y2={'1'}>
						<stop offset={'0%'} stopColor={'var(--color-feed)'} stopOpacity={0.35} />
						<stop offset={'100%'} stopColor={'var(--color-feed)'} stopOpacity={0.04} />
					</linearGradient>
					<linearGradient id={'fillSearch'} x1={'0'} y1={'0'} x2={'0'} y2={'1'}>
						<stop offset={'0%'} stopColor={'var(--color-search)'} stopOpacity={0.35} />
						<stop offset={'100%'} stopColor={'var(--color-search)'} stopOpacity={0.04} />
					</linearGradient>
				</defs>

				<Area
					dataKey={'feed'}
					type={'monotone'}
					stackId={'impressions'}
					stroke={'var(--color-feed)'}
					strokeWidth={2}
					fill={'url(#fillFeed)'}
				/>

				<Area
					dataKey={'search'}
					type={'monotone'}
					stackId={'impressions'}
					stroke={'var(--color-search)'}
					strokeWidth={2}
					fill={'url(#fillSearch)'}
				/>

				<ChartLegend content={<ChartLegendContent />} />
			</AreaChart>
		</ChartContainer>
	)
}
