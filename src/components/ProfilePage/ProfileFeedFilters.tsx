'use client'

import { cn } from '@/lib/utils'

type FilterType = 'all' | 'review' | 'like' | 'list'

type Props = Readonly<{
	active: FilterType
	onChange: (filter: FilterType) => void
}>

const filters: { value: FilterType; label: string }[] = [
	{ value: 'all', label: 'All' },
	{ value: 'like', label: 'Likes' },
	{ value: 'review', label: 'Reviews' },
	{ value: 'list', label: 'Lists' },
]

export type { FilterType }

export function ProfileFeedFilters(props: Props) {
	const { active, onChange } = props

	return (
		<div className={'flex gap-1.5'} role={'radiogroup'} aria-label={'Filter activity'}>
			{filters.map((f) => (
				<button
					key={f.value}
					type={'button'}
					role={'radio'}
					aria-checked={active === f.value}
					className={cn(
						'min-h-11 rounded-full px-4 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50',
						active === f.value
							? 'bg-primary text-primary-foreground'
							: 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground',
					)}
					onClick={() => onChange(f.value)}>
					{f.label}
				</button>
			))}
		</div>
	)
}
