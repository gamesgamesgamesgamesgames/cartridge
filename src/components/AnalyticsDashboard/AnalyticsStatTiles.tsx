// Module imports
import { type LucideIcon } from 'lucide-react'
import { type ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

// Types
export type StatTile = {
	/** Sentence-case label, no trailing colon. */
	label: string
	/** Preformatted headline value (already compacted / formatted). */
	value: string
	icon?: LucideIcon
	/** Optional secondary line under the value. */
	hint?: ReactNode
}

type Props = Readonly<{
	tiles: StatTile[]
	className?: string
}>

/**
 * A responsive row of headline stat tiles. Values are plain text (never a mark),
 * so they read for screen readers and survive the SVG-less test environment.
 */
export function AnalyticsStatTiles(props: Props) {
	const { tiles, className } = props

	return (
		<div
			className={twMerge(
				'grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4',
				className,
			)}>
			{tiles.map((tile) => {
				const Icon = tile.icon

				return (
					<div
						key={tile.label}
						className={
							'flex flex-col gap-1 rounded-lg border border-border bg-card p-4'
						}>
						<div
							className={
								'flex items-center gap-1.5 text-xs font-medium text-muted-foreground'
							}>
							{Icon && <Icon className={'size-3.5'} aria-hidden={'true'} />}
							<span>{tile.label}</span>
						</div>

						<span
							className={
								'text-2xl font-semibold tracking-tight tabular-nums'
							}>
							{tile.value}
						</span>

						{tile.hint && (
							<span className={'text-xs text-muted-foreground'}>
								{tile.hint}
							</span>
						)}
					</div>
				)
			})}
		</div>
	)
}
