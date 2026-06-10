import { cn } from '@/lib/utils'

type Props = Readonly<{
	rating: number
	max?: number
	showNumeric?: boolean
	size?: 'sm' | 'md' | 'lg'
	className?: string
}>

const sizeClasses = {
	sm: 'text-xs gap-0.5',
	md: 'text-sm gap-0.5',
	lg: 'text-base gap-1',
}

export function StarRating(props: Props) {
	const {
		rating,
		max = 10,
		showNumeric = false,
		size = 'sm',
		className,
	} = props

	const normalized = rating / (max / 5)
	const fullStars = Math.floor(normalized)
	const hasHalf = normalized - fullStars >= 0.5

	return (
		<span
			className={cn('inline-flex items-center', sizeClasses[size], className)}
			role={'img'}
			aria-label={`${rating} out of ${max}`}>
			{Array.from({ length: 5 }, (_, i) => {
				const filled = i < fullStars || (i === fullStars && hasHalf)
				return (
					<span
						key={i}
						aria-hidden={'true'}
						className={filled ? 'text-primary' : 'text-muted-foreground/50'}>
						{'★'}
					</span>
				)
			})}
			{showNumeric && (
				<span className={'ml-1 text-muted-foreground'}>
					{rating}/{max}
				</span>
			)}
		</span>
	)
}
