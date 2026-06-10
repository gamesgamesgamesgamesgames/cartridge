'use client'

import { Heart } from 'lucide-react'
import Link from 'next/link'

import { BoxArt } from '@/components/BoxArt/BoxArt'
import { TiltCard } from '@/components/TiltCard/TiltCard'
import { GAME_APPLICATION_TYPES } from '@/constants/GAME_APPLICATION_TYPES'
import { GAME_GENRES } from '@/constants/GAME_GENRES'
import { type CommunityFeedItem, type GameFeedGame } from '@/helpers/API'
import { formatLikeCount } from '@/helpers/formatLikeCount'
import { type ApplicationType } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'

type Props = Readonly<{
	game: GameFeedGame
	size?: 'default' | 'large'
	badge?: string
	subtitle?: string
	showGenres?: boolean
	recentActivity?: CommunityFeedItem[]
}>

const ACTION_LABELS: Record<CommunityFeedItem['type'], string> = {
	like: 'liked',
	review: 'reviewed',
	listAddGame: 'listed',
	listCreate: 'listed',
}

const INITIAL_COLORS = [
	'bg-primary/80',
	'bg-liked/80',
	'bg-amber-500/80',
	'bg-emerald-500/80',
	'bg-violet-500/80',
] as const

function getInitialColor(name: string): string {
	let hash = 0
	for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0
	return INITIAL_COLORS[Math.abs(hash) % INITIAL_COLORS.length]!
}

function SocialProof({ activity }: { activity: CommunityFeedItem[] }) {
	if (activity.length === 0) return null

	const uniqueActors = new Map<string, { name: string; did: string }>()
	const actionCounts = new Map<CommunityFeedItem['type'], number>()

	for (const item of activity) {
		if (!uniqueActors.has(item.actor.did)) {
			uniqueActors.set(item.actor.did, {
				name: item.actor.displayName ?? item.actor.handle ?? '?',
				did: item.actor.did,
			})
		}
		actionCounts.set(item.type, (actionCounts.get(item.type) ?? 0) + 1)
	}

	let primaryAction: CommunityFeedItem['type'] = activity[0]!.type
	let maxCount = 0
	for (const [type, count] of actionCounts) {
		if (count > maxCount) {
			primaryAction = type
			maxCount = count
		}
	}

	const actors = Array.from(uniqueActors.values()).slice(0, 3)
	const remaining = uniqueActors.size - actors.length
	const firstName = actors[0]?.name ?? 'Someone'

	let label: string
	if (uniqueActors.size === 1) {
		label = `${firstName} ${ACTION_LABELS[primaryAction]}`
	} else if (remaining === 0) {
		label = `${uniqueActors.size} ${ACTION_LABELS[primaryAction]}`
	} else {
		label = `${firstName} +${remaining} ${ACTION_LABELS[primaryAction]}`
	}

	return (
		<div className={'flex items-center gap-1.5'}>
			<div className={'flex -space-x-1.5'}>
				{actors.map((actor) => (
					<span
						key={actor.did}
						className={`flex size-4 items-center justify-center rounded-full text-[8px] font-bold leading-none text-white ring-1 ring-background ${getInitialColor(actor.name)}`}
						aria-hidden={'true'}>
						{actor.name.charAt(0).toUpperCase()}
					</span>
				))}
			</div>
			<span className={'truncate text-[10px] text-muted-foreground'}>
				{label}
			</span>
		</div>
	)
}

function getFirstReleaseYear(game: GameFeedGame): string | undefined {
	let earliest: string | undefined
	for (const release of game.releases ?? []) {
		for (const rd of release.releaseDates ?? []) {
			if (rd.releasedAt && (!earliest || rd.releasedAt < earliest)) {
				earliest = rd.releasedAt
			}
		}
	}
	return earliest?.slice(0, 4)
}

export function BrowseGameCard(props: Props) {
	const { game, size = 'default', badge, subtitle, showGenres, recentActivity } = props
	const year = getFirstReleaseYear(game)
	const href = game.slug ? `/game/${game.slug}` : undefined
	const likeCount = game.likeCount ?? 0
	const isLarge = size === 'large'

	const content = (
		<>
			<TiltCard>
				<div className={'relative'}>
					<BoxArt gameRecord={game} />
					{badge && (
						<span className={'absolute left-1.5 top-1.5 rounded bg-primary/90 px-1.5 py-0.5 text-xs font-bold uppercase tracking-wider text-primary-foreground'}>
							{badge}
						</span>
					)}
				</div>
			</TiltCard>
			<div className={'mt-1.5 px-0.5'}>
				<div className={`truncate font-medium ${isLarge ? 'text-base' : 'text-sm'}`}>
					{game.name}
				</div>

				{showGenres && Boolean(game.genres?.length) && (
					<div className={'mt-0.5 truncate text-xs text-muted-foreground'}>
						{game.genres!.slice(0, 2).map((g) => GAME_GENRES[g]?.name ?? g).join(', ')}
					</div>
				)}

				<div className={'flex items-center justify-between gap-2 text-xs text-muted-foreground'}>
					<span className={'truncate'}>
						{subtitle ?? [
							year,
							game.applicationType
								? GAME_APPLICATION_TYPES[game.applicationType as ApplicationType]?.name ?? game.applicationType
								: undefined,
						].filter(Boolean).join(' · ')}
					</span>
					{likeCount > 0 && (
						<span className={'flex shrink-0 items-center gap-0.5 text-liked'}>
							<Heart className={'size-3 fill-current'} aria-hidden={'true'} />
							{formatLikeCount(likeCount)}
						</span>
					)}
				</div>

				{recentActivity && recentActivity.length > 0 && (
					<SocialProof activity={recentActivity} />
				)}
			</div>
		</>
	)

	if (!href) {
		return (
			<div className={`block shrink-0 snap-start opacity-60 ${isLarge ? 'w-44 sm:w-56' : 'w-36 sm:w-40'}`}>
				{content}
			</div>
		)
	}

	return (
		<Link
			href={href}
			className={`block shrink-0 snap-start rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${isLarge ? 'w-44 sm:w-56' : 'w-36 sm:w-40'}`}>
			{content}
		</Link>
	)
}
