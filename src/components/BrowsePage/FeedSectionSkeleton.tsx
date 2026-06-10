import { Skeleton } from '@/components/ui/skeleton'

type Props = Readonly<{
	cardWidth?: 'default' | 'large'
	variant?: 'cards' | 'hero' | 'buzzing' | 'activity'
}>

export function FeedSectionSkeleton(props: Props) {
	const { cardWidth = 'default', variant = 'cards' } = props
	const isLarge = cardWidth === 'large'

	if (variant === 'hero') {
		return (
			<section aria-busy={'true'}>
				<Skeleton className={'aspect-[16/9] w-full md:aspect-[21/9]'} />
			</section>
		)
	}

	if (variant === 'buzzing') {
		return (
			<section aria-busy={'true'} className={'bg-card/40 py-8 md:py-12'}>
				<div className={'px-4 md:px-10 lg:px-16'}>
					<Skeleton className={'mb-6 h-8 w-48'} />
					<div className={'grid gap-x-6 gap-y-2 md:grid-cols-2 lg:grid-cols-3 lg:gap-x-8'}>
						{Array.from({ length: 9 }, (_, i) => (
							<div key={i} className={'flex items-center gap-4 py-3'}>
								<Skeleton className={'h-14 w-10 shrink-0 rounded-sm'} />
								<div className={'flex gap-4'}>
									<Skeleton className={'h-20 w-16 shrink-0 rounded-sm'} />
									<div>
										<Skeleton className={'h-5 w-32'} />
										<Skeleton className={'mt-1 h-3 w-20'} />
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>
		)
	}

	if (variant === 'activity') {
		return (
			<section aria-busy={'true'}>
				<div className={'px-4 md:px-10 lg:px-16'}>
					<Skeleton className={'mb-4 h-8 w-48'} />
				</div>
				<div className={'flex gap-3 overflow-hidden px-4 md:px-10 lg:px-16'}>
					{Array.from({ length: 15 }, (_, i) => (
						<Skeleton key={i} className={'h-24 w-72 shrink-0 rounded-lg'} />
					))}
				</div>
			</section>
		)
	}

	return (
		<section aria-busy={'true'}>
			<div className={'px-4 md:px-10 lg:px-16'}>
				<Skeleton className={`mb-4 h-8 ${isLarge ? 'w-48' : 'w-36'}`} />
			</div>
			<div className={'flex gap-4 overflow-hidden px-4 md:px-10 lg:px-16'}>
				{Array.from({ length: 15 }, (_, i) => (
					<div key={i} className={`shrink-0 ${isLarge ? 'w-56' : 'w-40'}`}>
						<Skeleton className={'aspect-[2.25/3] w-full rounded-sm'} />
						<Skeleton className={'mt-2 h-4 w-3/4'} />
						<Skeleton className={'mt-1 h-3 w-1/2'} />
					</div>
				))}
			</div>
		</section>
	)
}
