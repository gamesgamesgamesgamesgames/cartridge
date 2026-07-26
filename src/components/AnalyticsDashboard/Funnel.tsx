// Module imports
import { ArrowDown } from 'lucide-react'

// Local imports
import { formatCtr, formatFull } from '@/components/AnalyticsDashboard/formatDuration'

type Props = Readonly<{
	impressions: number
	pageviews: number
	actions: number
}>

type Step = {
	label: string
	value: number
	/** Ordinal Amber ramp — one hue, stepped by stage. */
	fill: string
}

/**
 * A three-stage discovery → engagement funnel (impressions → pageviews →
 * actions). Bar widths are proportional to the top of the funnel; the
 * conversion rate between consecutive stages is labelled directly, so the
 * numbers never rely on comparing bar lengths by eye.
 */
export function Funnel(props: Props) {
	const { impressions, pageviews, actions } = props

	const steps: Step[] = [
		{ label: 'Impressions', value: impressions, fill: 'var(--chart-1)' },
		{ label: 'Pageviews', value: pageviews, fill: 'color-mix(in oklab, var(--chart-1) 78%, var(--card))' },
		{ label: 'Actions', value: actions, fill: 'color-mix(in oklab, var(--chart-1) 56%, var(--card))' },
	]

	const top = Math.max(impressions, 1)

	return (
		<div className={'flex flex-col gap-2'}>
			{steps.map((step, index) => {
				const width = Math.max((step.value / top) * 100, 3)
				const previous = index === 0 ? null : steps[index - 1]
				const conversion =
					previous && previous.value > 0 ? step.value / previous.value : null

				return (
					<div key={step.label} className={'flex flex-col gap-2'}>
						{conversion !== null && (
							<div
								className={
									'flex items-center gap-1 pl-1 text-xs text-muted-foreground'
								}>
								<ArrowDown className={'size-3'} aria-hidden={'true'} />
								<span className={'tabular-nums'}>
									{formatCtr(conversion)} continue
								</span>
							</div>
						)}

						<div className={'flex items-center gap-3'}>
							<div
								className={
									'h-10 min-w-[3%] rounded-md transition-[width]'
								}
								style={{ width: `${width}%`, backgroundColor: step.fill }}
								aria-hidden={'true'}
							/>

							<div className={'flex flex-col leading-tight'}>
								<span className={'text-sm font-semibold tabular-nums'}>
									{formatFull(step.value)}
								</span>
								<span className={'text-xs text-muted-foreground'}>
									{step.label}
								</span>
							</div>
						</div>
					</div>
				)
			})}
		</div>
	)
}
