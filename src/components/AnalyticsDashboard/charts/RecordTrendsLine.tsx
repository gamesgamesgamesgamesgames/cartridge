'use client'

// Module imports
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'

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
	likes: { label: 'Likes', color: SERIES_COLORS.likes },
	reviews: { label: 'Reviews', color: SERIES_COLORS.reviews },
	listAdds: { label: 'List adds', color: SERIES_COLORS.listAdds },
} satisfies ChartConfig

type Point = Readonly<{
	date: string
	likes: number
	reviews: number
	listAdds: number
}>

type Props = Readonly<{
	data: Point[]
}>

/**
 * Multi-series line of authoritative record-creation trends (likes / reviews /
 * list adds) over time. Three series → legend always present; the tooltip lists
 * every series by name.
 */
export function RecordTrendsLine(props: Props) {
	const { data } = props

	return (
		<ChartContainer
			config={CHART_CONFIG}
			className={'aspect-auto h-[240px] w-full'}>
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
					dataKey={'likes'}
					type={'monotone'}
					stroke={'var(--color-likes)'}
					strokeWidth={2}
					dot={false}
					activeDot={{ r: 4 }}
				/>
				<Line
					dataKey={'reviews'}
					type={'monotone'}
					stroke={'var(--color-reviews)'}
					strokeWidth={2}
					dot={false}
					activeDot={{ r: 4 }}
				/>
				<Line
					dataKey={'listAdds'}
					type={'monotone'}
					stroke={'var(--color-listAdds)'}
					strokeWidth={2}
					dot={false}
					activeDot={{ r: 4 }}
				/>

				<ChartLegend content={<ChartLegendContent />} />
			</LineChart>
		</ChartContainer>
	)
}
