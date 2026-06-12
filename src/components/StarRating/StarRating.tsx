type Props = Readonly<{
	rating: number
	compact?: boolean
}>

function formatRating(rating: number): string {
	const out5 = rating / 2
	return out5 % 1 === 0 ? `${out5}/5` : `${out5.toFixed(1)}/5`
}

export function StarRating(props: Props) {
	const { rating, compact } = props
	const stars = rating / 2
	const fullStars = Math.floor(stars)
	const hasHalf = stars - fullStars >= 0.5

	return (
		<span
			className={`flex items-center gap-0.5 ${compact ? 'text-sm' : 'gap-1 text-lg'}`}
			aria-label={formatRating(rating)}>
			{Array.from({ length: 5 }, (_, i) => {
				if (i < fullStars) {
					return (
						<span key={i} className={'text-primary'} aria-hidden={'true'}>
							{'★'}
						</span>
					)
				}
				if (i === fullStars && hasHalf) {
					return (
						<span key={i} className={'relative'} aria-hidden={'true'}>
							<span className={'opacity-30'}>{'★'}</span>
							<span className={'absolute inset-0 overflow-hidden text-primary'} style={{ width: '50%' }}>
								{'★'}
							</span>
						</span>
					)
				}
				return (
					<span key={i} className={'opacity-30'} aria-hidden={'true'}>
						{'★'}
					</span>
				)
			})}
			<span className={`ml-1 text-muted-foreground ${compact ? 'text-xs' : 'text-sm'}`}>
				{formatRating(rating)}
			</span>
		</span>
	)
}
