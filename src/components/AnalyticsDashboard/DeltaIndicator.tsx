// Module imports
import { ArrowDown, ArrowUp, Minus } from 'lucide-react'

// Local imports
import { type Delta, formatDelta } from '@/helpers/analytics/aggregate'

// Constants
const DIRECTION = {
	up: { Icon: ArrowUp, className: 'text-trend-up', word: 'up' },
	down: { Icon: ArrowDown, className: 'text-trend-down', word: 'down' },
	flat: { Icon: Minus, className: 'text-muted-foreground', word: 'unchanged' },
} as const

type Props = Readonly<{
	delta: Delta | null
	/** What the later half is being measured against, e.g. 'previous 15 days'. */
	comparisonLabel: string
}>

/**
 * A period-over-period change.
 *
 * Direction is carried three ways — arrow shape, colour, and the sign in the
 * text — so it survives both colour-blindness and a monochrome render. The
 * comparison window is spelled out rather than implied, because "+18%" against
 * an unnamed baseline is a number pretending to be a fact.
 *
 * Renders nothing when there's no honest delta to show; callers should not
 * substitute a placeholder.
 */
export function DeltaIndicator(props: Props) {
	const { comparisonLabel, delta } = props

	const formatted = formatDelta(delta)

	if (!delta || !formatted) {
		return null
	}

	const { className, Icon, word } = DIRECTION[delta.direction]
	const isNew = delta.percent === null

	// Wraps rather than truncates: a delta whose baseline is cut off to
	// "vs previous 1…" is worse than one that takes a second line.
	return (
		<span className={'flex flex-wrap items-center gap-x-1'}>
			<span className={'flex items-center gap-1'}>
				<Icon
					aria-hidden={'true'}
					className={`size-3 shrink-0 ${className}`}
				/>

				<span className={`font-medium tabular-nums ${className}`}>
					{formatted}
				</span>
			</span>

			<span className={'text-muted-foreground'}>
				{isNew ? `since the ${comparisonLabel}` : `vs ${comparisonLabel}`}
			</span>

			<span className={'sr-only'}>
				{isNew
					? `, new activity compared with the ${comparisonLabel}`
					: `, ${word} compared with the ${comparisonLabel}`}
			</span>
		</span>
	)
}
