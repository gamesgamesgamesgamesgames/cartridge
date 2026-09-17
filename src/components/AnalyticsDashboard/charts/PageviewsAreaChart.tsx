'use client'

// Module imports
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

// Local imports
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	type ChartConfig,
} from '@/components/ui/chart'
import { formatCompact } from '@/components/AnalyticsDashboard/formatDuration'
import { SERIES_COLORS } from '@/components/AnalyticsDashboard/chartPalette'
import { shortDate } from '@/components/AnalyticsDashboard/charts/shortDate'
import { type TimeseriesPoint } from '@/helpers/analytics/types'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'

// Constants
const CHART_CONFIG = {
	value: { label: 'Pageviews', color: SERIES_COLORS.primary },
} satisfies ChartConfig

type Props = Readonly<{
	data: TimeseriesPoint[]
	className?: string
}>

/**
 * Catalog-wide pageviews per day.
 *
 * A single series, so there's no legend to disambiguate — the panel title names
 * the metric and the tooltip names the day. Amber because this is the studio's
 * headline number and Amber is the brand's signal colour.
 */
export function PageviewsAreaChart(props: Props) {
	const { className, data } = props

	const prefersReducedMotion = usePrefersReducedMotion()

	return (
		<ChartContainer
			config={CHART_CONFIG}
			className={className ?? 'aspect-auto h-[220px] w-full'}>
			<AreaChart data={data} margin={{ left: 4, right: 8, top: 8 }}>
				<CartesianGrid vertical={false} stroke={'var(--border)'} />

				<XAxis
					dataKey={'date'}
					tickLine={false}
					axisLine={false}
					tickMargin={8}
					minTickGap={32}
					tickFormatter={shortDate}
				/>

				<YAxis
					tickLine={false}
					axisLine={false}
					width={40}
					allowDecimals={false}
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
					<linearGradient id={'fillPageviews'} x1={'0'} y1={'0'} x2={'0'} y2={'1'}>
						<stop
							offset={'0%'}
							stopColor={'var(--color-value)'}
							stopOpacity={0.32}
						/>
						<stop
							offset={'100%'}
							stopColor={'var(--color-value)'}
							stopOpacity={0.02}
						/>
					</linearGradient>
				</defs>

				<Area
					dataKey={'value'}
					type={'monotone'}
					stroke={'var(--color-value)'}
					strokeWidth={2}
					fill={'url(#fillPageviews)'}
					isAnimationActive={!prefersReducedMotion}
					animationDuration={250}
				/>
			</AreaChart>
		</ChartContainer>
	)
}
