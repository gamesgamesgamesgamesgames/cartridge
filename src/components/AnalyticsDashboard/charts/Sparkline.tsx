// Module imports
import { useId } from 'react'

// Local imports
import { type TimeseriesPoint } from '@/helpers/analytics/types'

// Constants
const WIDTH = 96
const HEIGHT = 28
const PADDING = 3

type Props = Readonly<{
	points: TimeseriesPoint[]
	/** Accessible description, e.g. 'Pageviews over the last 30 days'. */
	label: string
}>

/**
 * A compact, dependency-free SVG sparkline. Hand-rolled rather than a Recharts
 * chart so it renders instantly in a table row (and in the SVG-less test
 * environment). The trend line is drawn in the muted ink; the current (last)
 * point is dotted in the Amber accent per the data-viz stat-tile contract.
 */
export function Sparkline(props: Props) {
	const { points, label } = props
	const gradientId = useId()

	if (points.length < 2) {
		return (
			<svg
				width={WIDTH}
				height={HEIGHT}
				viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
				role={'img'}
				aria-label={`${label}: not enough data`}
				className={'overflow-visible'}>
				<line
					x1={PADDING}
					y1={HEIGHT / 2}
					x2={WIDTH - PADDING}
					y2={HEIGHT / 2}
					stroke={'var(--border)'}
					strokeWidth={2}
					strokeLinecap={'round'}
				/>
			</svg>
		)
	}

	const values = points.map((point) => point.value)
	const max = Math.max(...values)
	const min = Math.min(...values)
	const span = max - min || 1

	const stepX = (WIDTH - PADDING * 2) / (points.length - 1)
	const scaleY = (value: number) =>
		HEIGHT - PADDING - ((value - min) / span) * (HEIGHT - PADDING * 2)

	const coords = points.map((point, index) => ({
		x: PADDING + index * stepX,
		y: scaleY(point.value),
	}))

	const linePath = coords
		.map((coord, index) => `${index === 0 ? 'M' : 'L'}${coord.x},${coord.y}`)
		.join(' ')

	const areaPath =
		`${linePath} L${coords[coords.length - 1].x},${HEIGHT - PADDING}` +
		` L${coords[0].x},${HEIGHT - PADDING} Z`

	const last = coords[coords.length - 1]

	return (
		<svg
			width={WIDTH}
			height={HEIGHT}
			viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
			role={'img'}
			aria-label={label}
			className={'overflow-visible'}>
			<defs>
				<linearGradient id={gradientId} x1={'0'} y1={'0'} x2={'0'} y2={'1'}>
					<stop offset={'0%'} stopColor={'var(--chart-1)'} stopOpacity={0.18} />
					<stop offset={'100%'} stopColor={'var(--chart-1)'} stopOpacity={0} />
				</linearGradient>
			</defs>

			<path d={areaPath} fill={`url(#${gradientId})`} stroke={'none'} />

			<path
				d={linePath}
				fill={'none'}
				stroke={'var(--muted-foreground)'}
				strokeWidth={1.5}
				strokeLinecap={'round'}
				strokeLinejoin={'round'}
			/>

			<circle
				cx={last.x}
				cy={last.y}
				r={2.5}
				fill={'var(--chart-1)'}
				stroke={'var(--card)'}
				strokeWidth={1.5}
			/>
		</svg>
	)
}
