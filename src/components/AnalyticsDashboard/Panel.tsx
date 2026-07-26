// Module imports
import { type ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

type Props = Readonly<{
	title: string
	description?: ReactNode
	children: ReactNode
	className?: string
}>

/** A titled surface panel — the repeated container for each analytics section. */
export function Panel(props: Props) {
	const { title, description, children, className } = props

	return (
		<section
			className={twMerge(
				'flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:p-5',
				className,
			)}>
			<div className={'flex flex-col gap-0.5'}>
				<h2 className={'text-sm font-semibold'}>{title}</h2>
				{description && (
					<p className={'text-xs text-muted-foreground'}>{description}</p>
				)}
			</div>

			{children}
		</section>
	)
}
