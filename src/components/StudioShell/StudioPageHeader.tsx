// Module imports
import { type ReactNode } from 'react'

// Types
type Props = Readonly<{
	title: string
	description?: ReactNode
	/** Controls for this page — buttons, range selectors, filters. */
	actions?: ReactNode
}>

/**
 * The heading block every studio page opens with.
 *
 * Replaces the breadcrumb strip at the top level: with real section navigation
 * in {@link StudioNav}, a single-crumb breadcrumb only repeats what the active
 * tab already says. Breadcrumbs still earn their place one level deeper.
 */
export function StudioPageHeader(props: Props) {
	const { actions, description, title } = props

	return (
		<div className={'flex flex-wrap items-end justify-between gap-x-6 gap-y-3'}>
			<div className={'flex min-w-0 flex-col gap-1'}>
				<h1 className={'text-xl font-semibold tracking-tight'}>{title}</h1>

				{Boolean(description) && (
					<p className={'max-w-[60ch] text-sm text-muted-foreground'}>
						{description}
					</p>
				)}
			</div>

			{Boolean(actions) && (
				<div className={'flex shrink-0 items-center gap-2'}>{actions}</div>
			)}
		</div>
	)
}
