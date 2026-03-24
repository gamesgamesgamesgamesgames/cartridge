import { Container } from '@/components/Container/Container'

import type { PlatformStats } from '@/helpers/API'

type Props = Readonly<{
	stats: PlatformStats | null
}>

function formatCount(n: number): string {
	if (n >= 1000) {
		return n.toLocaleString() + '+'
	}
	return String(n)
}

export function StatsBar({ stats }: Props) {
	if (!stats) return null

	const items = [
		stats.totalGames > 0 && `${formatCount(stats.totalGames)} Games`,
		stats.totalStudios > 0 && `${formatCount(stats.totalStudios)} Studios`,
		stats.totalReviews > 0 && `${formatCount(stats.totalReviews)} Reviews`,
	].filter(Boolean) as string[]

	if (items.length === 0) return null

	return (
		<section className={'bg-primary/5 py-6'}>
			<Container>
				<div className={'flex items-center justify-center gap-6 text-sm font-medium text-muted-foreground'}>
					{items.map((item, i) => (
						<span key={i}>
							{i > 0 && (
								<span
									className={'mr-6'}
									aria-hidden>
									{'\u00b7'}
								</span>
							)}
							{item}
						</span>
					))}
				</div>
			</Container>
		</section>
	)
}
