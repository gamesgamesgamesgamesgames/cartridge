'use client'

// Module imports
import { useCallback } from 'react'

// Local imports
import {
	ANALYTICS_RANGES,
	type AnalyticsRange,
} from '@/helpers/analytics/constants'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

// Constants
const RANGE_LABELS: Record<AnalyticsRange, string> = {
	'7d': '7 days',
	'30d': '30 days',
	'90d': '90 days',
}

type Props = Readonly<{
	range: AnalyticsRange
	onRangeChange: (range: AnalyticsRange) => void
	disabled?: boolean
}>

/** Global 7d / 30d / 90d time-range selector shared by the analytics views. */
export function RangeSelector(props: Props) {
	const { range, onRangeChange, disabled } = props

	const handleValueChange = useCallback(
		(value: string) => {
			// ToggleGroup emits '' when the active item is re-clicked; ignore it so a
			// range is always selected.
			if (value) {
				onRangeChange(value as AnalyticsRange)
			}
		},
		[onRangeChange],
	)

	return (
		<ToggleGroup
			type={'single'}
			value={range}
			onValueChange={handleValueChange}
			variant={'outline'}
			size={'sm'}
			disabled={disabled}
			aria-label={'Time range'}>
			{ANALYTICS_RANGES.map((option) => (
				<ToggleGroupItem key={option} value={option}>
					{RANGE_LABELS[option]}
				</ToggleGroupItem>
			))}
		</ToggleGroup>
	)
}
