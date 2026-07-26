'use client'

// Module imports
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'

// Local imports
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	type ChartConfig,
} from '@/components/ui/chart'
import { type TimeseriesPoint } from '@/helpers/analytics/types'
import { formatCompact } from '@/components/AnalyticsDashboard/formatDuration'
import { SERIES_COLORS } from '@/components/AnalyticsDashboard/chartPalette'
import { shortDate } from '@/components/AnalyticsDashboard/charts/shortDate'

// Constants
const CHART_CONFIG = {
	value: { label: 'Unique visitors', color: SERIES_COLORS.primary },
} satisfies ChartConfig

type Props = Readonly<{
	data: TimeseriesPoint[]
}>

/**
 * Single-series line of unique visitors per day. One series → no legend box; the
 * panel title names the measure.
 */
export function DailyUniquesLine(props: Props) {
	const { data } = props

	return (
		<ChartContainer
			config={CHART_CONFIG}
			className={'aspect-auto h-[200px] w-full'}>
			<LineChart data={data} margin={{ left: 4, right: 12, top: 8 }}>
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

				<Line
					dataKey={'value'}
					type={'monotone'}
					stroke={'var(--color-value)'}
					strokeWidth={2}
					dot={false}
					activeDot={{ r: 4 }}
				/>
			</LineChart>
		</ChartContainer>
	)
}
