'use client'

import { LogIn, Search } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { isAuthenticated } from '@/helpers/oauth'
import { type PlatformStats } from '@/helpers/API'

type Props = Readonly<{
	id?: string
	stats: PlatformStats | null
}>

function formatStatNumber(n: number): string {
	if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
	if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`
	return n.toLocaleString()
}

export function CommunityFooter({ id, stats }: Props) {
	const authed = isAuthenticated()

	return (
		<section id={id} className={'scroll-mt-32 px-4 md:px-10 lg:px-16'}>
			<div className={'rounded-xl bg-card/30 px-6 py-12 md:px-10'}>
				<p className={'font-[family-name:var(--font-cartridge)] text-2xl font-bold leading-tight md:text-3xl'}>
					{'The catalog is open.'}
				</p>

				{stats && (
					<p className={'mt-3 max-w-md text-sm text-muted-foreground'}>
						{`${formatStatNumber(stats.totalGames)} games cataloged by players like you. ${formatStatNumber(stats.totalReviews)} reviews written. ${formatStatNumber(stats.totalStudios)} studios represented. All of it community-driven, all of it on the open web.`}
					</p>
				)}

				{!stats && (
					<p className={'mt-3 max-w-md text-sm text-muted-foreground'}>
						{'Games cataloged, reviews written, lists curated. All of it community-driven, all of it on the open web.'}
					</p>
				)}

				<div className={'mt-6 flex flex-wrap gap-3'}>
					<Button asChild size={'lg'}>
						<Link href={'/search'}>
							<Search className={'size-4'} aria-hidden={'true'} />
							{'Explore all games'}
						</Link>
					</Button>
					{!authed && (
						<Button asChild variant={'outline'} size={'lg'}>
							<Link href={'/login'}>
								<LogIn className={'size-4'} aria-hidden={'true'} />
								{'Join the community'}
							</Link>
						</Button>
					)}
				</div>
			</div>
		</section>
	)
}
