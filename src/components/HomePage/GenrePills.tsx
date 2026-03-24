import Link from 'next/link'

import { Container } from '@/components/Container/Container'
import { Header } from '@/components/Header/Header'
import { Scroller } from '@/components/ui/scroller'
import { GAME_GENRES } from '@/constants/GAME_GENRES'

import type { GenreCountItem } from '@/helpers/API'

type Props = Readonly<{
	genreCounts: GenreCountItem[]
}>

export function GenrePills({ genreCounts }: Props) {
	if (genreCounts.length === 0) return null

	const countMap = new Map(genreCounts.map((g) => [g.genre, g.count]))

	const genres = Object.entries(GAME_GENRES)
		.map(([key, { name }]) => ({
			key,
			name,
			count: countMap.get(key) ?? 0,
		}))
		.filter((g) => g.count > 0)

	if (genres.length === 0) return null

	return (
		<section className={'py-12'}>
			<Container>
				<Header level={3}>{'Browse by Genre'}</Header>
				<Scroller
					orientation={'horizontal'}
					hideScrollbar
					withNavigation
					scrollStep={200}>
					<div className={'-mx-4 flex gap-3 px-4 py-4'}>
						{genres.map((genre) => (
							<Link
								key={genre.key}
								href={`/browse?genre=${genre.key}`}
								className={
									'flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground'
								}>
								{genre.name}
								<span className={'rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground'}>
									{genre.count.toLocaleString()}
								</span>
							</Link>
						))}
					</div>
				</Scroller>
			</Container>
		</section>
	)
}
