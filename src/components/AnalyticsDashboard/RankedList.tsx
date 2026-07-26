// Module imports
import { twMerge } from 'tailwind-merge'

// Local imports
import { type NamedCount } from '@/helpers/analytics/types'
import { formatCompact } from '@/components/AnalyticsDashboard/formatDuration'

type Props = Readonly<{
	items: NamedCount[]
	/** Friendly label for a raw `name`; defaults to the name itself. */
	labelFor?: (name: string) => string
	/** Copy shown when there are no rows. */
	emptyLabel?: string
	className?: string
}>

/**
 * A ranked list of labelled counts, each with a proportional magnitude track.
 * Pure DOM (no SVG) so it doubles as the accessible table view for the same
 * data and renders reliably everywhere.
 */
export function RankedList(props: Props) {
	const { items, labelFor, emptyLabel = 'No data yet', className } = props

	if (!items.length) {
		return (
			<p className={'py-6 text-center text-xs text-muted-foreground'}>
				{emptyLabel}
			</p>
		)
	}

	const max = Math.max(...items.map((item) => item.count), 1)

	return (
		<ol className={twMerge('flex flex-col gap-2.5', className)}>
			{items.map((item, index) => {
				const label = labelFor ? labelFor(item.name) : item.name
				const pct = Math.max((item.count / max) * 100, 2)

				return (
					<li
						key={item.name}
						className={'flex items-center gap-3 text-sm'}>
						<span
							className={
								'w-4 shrink-0 text-right text-xs tabular-nums text-muted-foreground'
							}
							aria-hidden={'true'}>
							{index + 1}
						</span>

						<div className={'flex min-w-0 flex-1 flex-col gap-1'}>
							<div className={'flex items-baseline justify-between gap-2'}>
								<span className={'truncate'}>{label}</span>
								<span
									className={
										'shrink-0 text-xs tabular-nums text-muted-foreground'
									}>
									{formatCompact(item.count)}
								</span>
							</div>

							<div
								className={'h-1.5 w-full overflow-hidden rounded-full bg-muted'}>
								<div
									className={'h-full rounded-full bg-primary'}
									style={{ width: `${pct}%` }}
								/>
							</div>
						</div>
					</li>
				)
			})}
		</ol>
	)
}
