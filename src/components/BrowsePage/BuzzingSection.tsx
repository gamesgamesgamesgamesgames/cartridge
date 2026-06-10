'use client'

import { Flame, Heart, List, MessageSquare } from 'lucide-react'
import Link from 'next/link'

import { BoxArt } from '@/components/BoxArt/BoxArt'
import { Header } from '@/components/Header/Header'
import { GAME_GENRES } from '@/constants/GAME_GENRES'
import { type GameFeedGame } from '@/helpers/API'
import { formatLikeCount } from '@/helpers/formatLikeCount'

type Props = Readonly<{
	id?: string
	games: GameFeedGame[]
}>

function BuzzStats({ game, rank }: { game: GameFeedGame; rank: number }) {
	const weeklyLikes = game.weeklyLikes ?? 0
	const weeklyReviews = game.weeklyReviews ?? 0
	const weeklyListAdds = game.weeklyListAdds ?? 0
	const totalLikes = game.likeCount ?? 0
	const hasWeeklyStats = weeklyLikes > 0 || weeklyReviews > 0 || weeklyListAdds > 0

	if (hasWeeklyStats) {
		return (
			<div className={'flex items-center gap-3 text-xs'}>
				{weeklyLikes > 0 && (
					<span className={'flex items-center gap-1 text-liked'}>
						<Heart className={'size-3 fill-current'} aria-hidden={'true'} />
						{formatLikeCount(weeklyLikes)}
					</span>
				)}
				{weeklyReviews > 0 && (
					<span className={'flex items-center gap-1 text-muted-foreground'}>
						<MessageSquare className={'size-3'} aria-hidden={'true'} />
						{formatLikeCount(weeklyReviews)}
					</span>
				)}
				{weeklyListAdds > 0 && (
					<span className={'flex items-center gap-1 text-muted-foreground'}>
						<List className={'size-3'} aria-hidden={'true'} />
						{formatLikeCount(weeklyListAdds)}
					</span>
				)}
				<span className={'text-muted-foreground/60'}>{'this week'}</span>
			</div>
		)
	}

	if (totalLikes > 0) {
		return (
			<div className={'flex items-center gap-3 text-xs'}>
				<span className={'flex items-center gap-1 text-liked'}>
					<Heart className={'size-3 fill-current'} aria-hidden={'true'} />
					{formatLikeCount(totalLikes)}
				</span>
			</div>
		)
	}

	return (
		<div className={'flex items-center gap-1.5 text-xs text-liked/70'}>
			<Flame className={'size-3'} aria-hidden={'true'} />
			<span>{`#${rank} trending`}</span>
		</div>
	)
}

function FeaturedCard({ game, rank }: { game: GameFeedGame; rank: number }) {
	const href = game.slug ? `/game/${game.slug}` : undefined

	const inner = (
		<div className={'flex items-center gap-1'}>
			<span
				className={'z-0 shrink-0 select-none font-[family-name:var(--font-cartridge)] text-7xl font-black leading-[0.8] text-liked/20 md:text-8xl'}
				aria-hidden={'true'}>
				{rank}
			</span>

			<div className={'relative z-10 -ml-3 w-16 shrink-0 md:-ml-4 md:w-20'}>
				<BoxArt gameRecord={game} />
			</div>

			<div className={'ml-2 flex min-w-0 flex-1 flex-col gap-1 md:ml-3'}>
				<span className={'font-[family-name:var(--font-cartridge)] text-lg font-bold leading-tight md:text-xl'}>
					{game.name}
				</span>
				{Boolean(game.genres?.length) && (
					<span className={'truncate text-xs text-muted-foreground'}>
						{game.genres!.slice(0, 2).map((g) => GAME_GENRES[g]?.name ?? g).join(', ')}
					</span>
				)}
				<BuzzStats game={game} rank={rank} />
			</div>
		</div>
	)

	if (!href) return <div className={'rounded-lg px-4 py-3'}>{inner}</div>

	return (
		<Link
			href={href}
			className={'block rounded-lg px-4 py-3 transition-colors hover:bg-foreground/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'}>
			{inner}
		</Link>
	)
}

export function BuzzingSection({ id, games }: Props) {
	if (games.length === 0) return null

	// Cap to 6 — fills evenly at both md (2 cols × 3) and lg (3 cols × 2)
	const ranked = games.slice(0, 6)

	return (
		<section id={id} className={'scroll-mt-32 bg-card/40 py-8 md:py-12'}>
			<div className={'px-4 md:px-10 lg:px-16'}>
				<div className={'mb-6 flex items-baseline justify-between'}>
					<Header className={'text-xl'} level={3}>
						<span className={'text-liked'}>{'Buzzing'}</span>
						{' This Week'}
					</Header>
				</div>

				<div className={'grid gap-x-6 gap-y-1 md:grid-cols-2 lg:grid-cols-3 lg:gap-x-8'}>
					{ranked.map((game, i) => (
						<FeaturedCard key={game.uri} game={game} rank={i + 1} />
					))}
				</div>
			</div>
		</section>
	)
}
