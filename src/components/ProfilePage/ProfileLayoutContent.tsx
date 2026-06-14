'use client'

import { useCallback, useEffect, useState } from 'react'
import { useStore } from 'statery'

import { Gamepad2, ListChecks, MessageSquareText, Plus, Shield } from 'lucide-react'

import * as API from '@/helpers/API'
import { BoxArt } from '@/components/BoxArt/BoxArt'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/Container/Container'
import { PendingClaimCard } from '@/components/ProfilePage/PendingClaimCard'
import { ProfileActivityFeed } from '@/components/ProfilePage/ProfileActivityFeed'
import { ProfileGameCard } from '@/components/ProfilePage/ProfileGameCard'
import { ProfileHeader } from '@/components/ProfilePage/ProfileHeader'
import { StarRating } from '@/components/ui/star-rating'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { type ActorProfileDetailView } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'
import { type OrgProfileDetailView } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'
import { type ClaimView, type GameFeedGame, type GenrePreference, type UserListView } from '@/helpers/API'
import { type PopfeedReview } from '@/helpers/lexicons/games/gamesgamesgamesgames/getReviews.defs'
import { type GameRecord } from '@/typedefs/GameRecord'
import { store } from '@/store/store'
import Link from 'next/link'

function formatTabCount(n: number): string {
	if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
	if (n >= 10000) return `${(n / 1000).toFixed(0)}K`
	if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
	return String(n)
}

type Props = Readonly<{
	avatarUrl?: string
	basePath: string
	favorites: GameFeedGame[]
	gameCount: number
	games: GameRecord[]
	genres: GenrePreference[]
	handle: string
	followerCount: number
	followingCount: number
	isFollowing: boolean
	isFollowedBy: boolean
	likeCount: number
	listCount: number
	lists: UserListView[]
	profile: ActorProfileDetailView | OrgProfileDetailView
	reviewCount: number
	reviews: PopfeedReview[]
	verifiedAccountType?: 'studio' | 'developer' | 'publisher'
}>

export function ProfileLayoutContent(props: Props) {
	const {
		avatarUrl,
		basePath,
		favorites,
		gameCount,
		games,
		genres,
		handle,
		followerCount,
		followingCount,
		isFollowing,
		isFollowedBy,
		likeCount,
		listCount,
		lists,
		profile,
		reviewCount,
		reviews,
		verifiedAccountType,
	} = props

	const { user } = useStore(store)
	const isOwnProfile = user?.did === profile.did

	const [pendingContributionCount, setPendingContributionCount] = useState(0)

	useEffect(() => {
		if (!isOwnProfile || !user?.did) return
		API.listContributions({ status: 'pending', contributor: user.did, limit: 100 })
			.then((result) => {
				setPendingContributionCount(result.contributions.length)
			})
			.catch(() => {})
	}, [isOwnProfile, user?.did])

	return (
		<div className={'flex min-h-screen flex-col'}>
			<a
				href={'#profile-content'}
				className={'sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-lg'}>
				{'Skip to content'}
			</a>

			<ProfileHeader
				avatarUrl={avatarUrl}
				favorites={favorites}
				followerCount={followerCount}
				followingCount={followingCount}
				genres={genres}
				handle={handle}
				isFollowedBy={isFollowedBy}
				isFollowing={isFollowing}
				isOwnProfile={isOwnProfile}
				profile={profile}
				verifiedAccountType={verifiedAccountType}
			/>

			<section id={'profile-content'} className={'flex-1 bg-background py-6'}>
				<Container className={'overflow-visible'} isScrollable={false}>
					<Tabs defaultValue={'activity'}>
						<TabsList variant={'line'} className={'w-full justify-start border-b border-border'}>
							<TabsTrigger value={'activity'}>
								{'Activity'}
								{isOwnProfile && pendingContributionCount > 0 && (
									<span className={'ml-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground'}>
										{pendingContributionCount > 9 ? '9+' : pendingContributionCount}
									</span>
								)}
							</TabsTrigger>
							{verifiedAccountType && (
								<TabsTrigger value={'games'}>
									{'Games'}
									{gameCount > 0 && (
										<span className={'ml-1 text-muted-foreground'}>
											{'('}{formatTabCount(gameCount)}{')'}
										</span>
									)}
								</TabsTrigger>
							)}
							<TabsTrigger value={'reviews'}>
								{'Reviews'}
								{reviewCount > 0 && (
									<span className={'ml-1 text-muted-foreground'}>
										{'('}{formatTabCount(reviewCount)}{')'}
									</span>
								)}
							</TabsTrigger>
							<TabsTrigger value={'lists'}>
								{'Lists'}
								{listCount > 0 && (
									<span className={'ml-1 text-muted-foreground'}>
										{'('}{formatTabCount(listCount)}{')'}
									</span>
								)}
							</TabsTrigger>
						</TabsList>

						<TabsContent value={'activity'} className={'pt-4'}>
							<ProfileActivityFeed
								profileDid={profile.did}
								isOwnProfile={isOwnProfile}
							/>
						</TabsContent>

						<TabsContent value={'games'} className={'pt-4'}>
							<GamesTabContent
								games={games}
								basePath={basePath}
								isOwnProfile={isOwnProfile}
								profileDid={profile.did}
							/>
						</TabsContent>

						<TabsContent value={'reviews'} className={'pt-4'}>
							<ReviewsTabContent
								reviews={reviews}
								basePath={basePath}
								isOwnProfile={isOwnProfile}
							/>
						</TabsContent>

						<TabsContent value={'lists'} className={'pt-4'}>
							<ListsTabContent
								lists={lists}
								basePath={basePath}
								isOwnProfile={isOwnProfile}
							/>
						</TabsContent>
					</Tabs>
				</Container>
			</section>
		</div>
	)
}

function GamesTabContent(props: {
	games: GameRecord[]
	basePath: string
	isOwnProfile: boolean
	profileDid: string
}) {
	const { games, isOwnProfile } = props
	const [pendingClaims, setPendingClaims] = useState<ClaimView[]>([])

	const fetchClaims = useCallback(async () => {
		if (!isOwnProfile) return
		try {
			const [pendingResult, deniedResult] = await Promise.all([
				API.listClaims({ status: 'pending' }),
				API.listClaims({ status: 'denied' }),
			])
			setPendingClaims([...pendingResult.claims, ...deniedResult.claims])
		} catch {
			// Claims are supplementary; don't block the page
		}
	}, [isOwnProfile])

	useEffect(() => {
		fetchClaims()
	}, [fetchClaims])

	const hasContent = games.length > 0 || pendingClaims.length > 0

	return (
		<div className={'flex flex-col gap-6'}>
			{isOwnProfile && (
				<div className={'flex items-center gap-3'}>
					<Button asChild size={'sm'}>
						<Link href={'/dashboard/catalog/new-game'}>
							<Plus className={'size-4'} />
							{'Add Game'}
						</Link>
					</Button>
					<Button asChild size={'sm'} variant={'outline'}>
						<Link href={'/claim'}>
							<Shield className={'size-4'} />
							{'Claim Games'}
						</Link>
					</Button>
				</div>
			)}

			{!hasContent ? (
				isOwnProfile ? (
					<div className={'flex flex-col items-center gap-3 py-10'}>
						<div className={'flex size-10 items-center justify-center rounded-lg bg-muted'}>
							<Gamepad2 className={'size-5 text-muted-foreground'} aria-hidden={'true'} />
						</div>
						<div className={'flex flex-col items-center gap-1 text-center'}>
							<p className={'text-sm font-medium text-foreground'}>
								{'No games here yet'}
							</p>
							<p className={'max-w-xs text-sm text-muted-foreground'}>
								{'Add your first game or claim ownership of existing ones.'}
							</p>
						</div>
					</div>
				) : (
					<p className={'py-8 text-center text-sm text-muted-foreground'}>
						{'No games yet'}
					</p>
				)
			) : (
				<div className={'grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'}>
					{games.map((game) => (
						<ProfileGameCard
							key={game.uri}
							game={game}
							isOwnProfile={isOwnProfile}
						/>
					))}
					{pendingClaims.map((claim) => (
						<PendingClaimCard key={claim.uri} claim={claim} />
					))}
				</div>
			)}
		</div>
	)
}

function ReviewsTabContent(props: {
	reviews: PopfeedReview[]
	basePath: string
	isOwnProfile: boolean
}) {
	const { reviews, isOwnProfile } = props

	if (reviews.length === 0) {
		if (!isOwnProfile) {
			return (
				<p className={'py-8 text-center text-sm text-muted-foreground'}>
					{'No reviews yet'}
				</p>
			)
		}

		return (
			<div className={'flex flex-col items-center gap-3 py-10'}>
				<div className={'flex size-10 items-center justify-center rounded-lg bg-muted'}>
					<MessageSquareText className={'size-5 text-muted-foreground'} aria-hidden={'true'} />
				</div>
				<div className={'flex flex-col items-center gap-1 text-center'}>
					<p className={'text-sm font-medium text-foreground'}>
						{'Share what you think'}
					</p>
					<p className={'max-w-xs text-sm text-muted-foreground'}>
						{'Rate and review games you\'ve played. Your reviews also shape your taste profile.'}
					</p>
				</div>
				<Button asChild variant={'outline'} size={'sm'}>
					<Link href={'/browse'}>
						{'Browse games'}
					</Link>
				</Button>
			</div>
		)
	}

	return (
		<div className={'flex flex-col gap-3'}>
			{reviews.map((review) => (
				<article
					key={review.uri}
					className={'rounded-lg border border-border bg-card p-4'}>
					<div className={'flex items-start justify-between gap-3'}>
						<div className={'flex flex-col gap-1'}>
							<p className={'truncate text-sm font-semibold'}>
								{review.title ?? 'Untitled review'}
							</p>
							<StarRating rating={review.rating} size={'sm'} showNumeric />
						</div>
					</div>

					{review.text && (
						<p className={'mt-2 max-w-prose text-pretty text-sm leading-relaxed text-muted-foreground'}>
							{review.text.length > 400
								? review.text.slice(0, 400) + '...'
								: review.text}
						</p>
					)}
				</article>
			))}
		</div>
	)
}

const STACK_ROTATIONS = [-3, -1, 1, 2.5]

function ListCoverStack(props: { items: UserListView['previewItems'] }) {
	const items = props.items
	if (!items || items.length === 0) {
		return (
			<div className={'flex items-center justify-center rounded-md bg-muted'} style={{ width: '56px', height: '78px' }}>
				<ListChecks className={'size-6 text-muted-foreground'} aria-hidden={'true'} />
			</div>
		)
	}

	const covers = items.slice(0, 4)

	return (
		<div
			className={'relative shrink-0'}
			style={{ width: `${56 + (covers.length - 1) * 18}px`, height: '78px' }}
			aria-hidden={'true'}>
			{covers.map((item, i) => (
				<div
					key={item.uri}
					className={'absolute top-0 overflow-hidden rounded-md shadow-md ring-1 ring-border/40 transition-transform duration-200'}
					style={{
						left: `${i * 18}px`,
						zIndex: covers.length - i,
						width: '56px',
						height: '78px',
						transform: `rotate(${STACK_ROTATIONS[i]}deg)`,
					}}>
					<BoxArt
						gameRecord={item}
						className={'size-full rounded-md'}
					/>
				</div>
			))}
		</div>
	)
}

function extractRkey(uri: string): string {
	const parts = uri.split('/')
	return parts[parts.length - 1]
}

function ListsTabContent(props: {
	lists: UserListView[]
	basePath: string
	isOwnProfile: boolean
}) {
	const { lists, basePath, isOwnProfile } = props

	if (lists.length === 0) {
		if (!isOwnProfile) {
			return (
				<p className={'py-8 text-center text-sm text-muted-foreground'}>
					{'No lists yet'}
				</p>
			)
		}

		return (
			<div className={'flex flex-col items-center gap-3 py-10'}>
				<div className={'flex size-10 items-center justify-center rounded-lg bg-muted'}>
					<ListChecks className={'size-5 text-muted-foreground'} aria-hidden={'true'} />
				</div>
				<div className={'flex flex-col items-center gap-1 text-center'}>
					<p className={'text-sm font-medium text-foreground'}>
						{'Organize your collection'}
					</p>
					<p className={'max-w-xs text-sm text-muted-foreground'}>
						{'Group games into lists like "Playing Now", "All-Time Favorites", or anything you want.'}
					</p>
				</div>
			</div>
		)
	}

	return (
		<div className={'flex flex-col gap-5'}>
			{lists.map((list) => (
				<Link
					key={list.uri}
					href={`${basePath}/list/${extractRkey(list.uri)}`}
					className={'group flex items-center gap-5 rounded-xl px-4 py-4 -mx-4 transition-colors hover:bg-card/60'}>
					<ListCoverStack items={list.previewItems} />
					<div className={'flex min-w-0 flex-1 flex-col gap-1'}>
						<span className={'truncate text-base font-semibold text-foreground'}>{list.name}</span>
						{list.description && (
							<p className={'line-clamp-2 text-sm text-muted-foreground'}>
								{list.description}
							</p>
						)}
						<span className={'text-xs text-muted-foreground'}>
							{list.itemCount} {list.itemCount === 1 ? 'game' : 'games'}
						</span>
					</div>
				</Link>
			))}
		</div>
	)
}
