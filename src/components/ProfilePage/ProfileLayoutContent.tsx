// Local imports
import { BoxArt } from '@/components/BoxArt/BoxArt'
import { Container } from '@/components/Container/Container'
import { ProfileActivityFeed } from '@/components/ProfilePage/ProfileActivityFeed'
import {
	ProfileBannerHeader,
	type ProfileStats,
} from '@/components/ProfilePage/ProfileBannerHeader'
import { ProfileSidebarCard } from '@/components/ProfilePage/ProfileSidebarCard'
import { type ActorProfileDetailView } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'
import { type OrgProfileDetailView } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'
import { type PopfeedReview } from '@/helpers/lexicons/games/gamesgamesgamesgames/getReviews.defs'
import { type GameRecord } from '@/typedefs/GameRecord'
import Link from 'next/link'

// Types
type Props = Readonly<{
	avatarUrl?: string
	basePath: string
	games: GameRecord[]
	handle: string
	likeCount: number
	profile: ActorProfileDetailView | OrgProfileDetailView
	reviews: PopfeedReview[]
}>

function StarRatingCompact(props: { rating: number }) {
	const stars = props.rating / 2
	const fullStars = Math.floor(stars)

	return (
		<span className={'flex items-center gap-0.5 text-xs'}>
			{Array.from({ length: 5 }, (_, i) => (
				<span key={i} className={i < fullStars ? '' : 'opacity-30'}>
					{'★'}
				</span>
			))}
		</span>
	)
}

export function ProfileLayoutContent(props: Props) {
	const {
		avatarUrl,
		basePath,
		games,
		handle,
		likeCount,
		profile,
		reviews,
	} = props

	const stats: ProfileStats = {
		games: games.length,
		reviews: reviews.length,
		likes: likeCount,
		lists: 0,
	}

	return (
		<div className={'flex min-h-screen flex-col'}>
			<ProfileBannerHeader
				avatarUrl={avatarUrl}
				handle={handle}
				profile={profile}
				stats={stats}
			/>

			<section className={'flex-1 bg-secondary py-10'}>
				<Container className={'overflow-visible'} isScrollable={false}>
					<div className={'flex flex-col gap-10 lg:flex-row lg:gap-12'}>
						{/* Main column */}
						<div className={'flex min-w-0 flex-1 flex-col gap-8'}>
							<ProfileActivityFeed profileDid={profile.did} />
						</div>

						{/* Sidebar */}
						<div className={'flex w-full flex-col gap-4 lg:w-80 lg:shrink-0 lg:sticky lg:top-20 lg:self-start'}>
							{/* Reviews card */}
							<ProfileSidebarCard
								title={'Reviews'}
								count={reviews.length}
								href={`${basePath}/reviews`}>
								{reviews.length === 0 ? (
									<p className={'text-sm text-muted-foreground'}>
										{'No reviews yet'}
									</p>
								) : (
									<div className={'flex flex-col gap-2'}>
										{reviews.slice(0, 3).map((review) => (
											<div
												key={review.uri}
												className={'flex items-center justify-between gap-2'}>
												<span className={'truncate text-sm'}>
													{review.title ?? 'Untitled review'}
												</span>
												<StarRatingCompact rating={review.rating} />
											</div>
										))}
									</div>
								)}
							</ProfileSidebarCard>

							{/* Lists card (placeholder) */}
							<ProfileSidebarCard
								title={'Lists'}
								count={0}
								href={`${basePath}/lists`}>
								<p className={'text-sm text-muted-foreground'}>
									{'No lists yet'}
								</p>
							</ProfileSidebarCard>

							{/* Games card — only shown if user has games */}
							{games.length > 0 && (
								<ProfileSidebarCard
									title={'Games'}
									count={games.length}
									href={`${basePath}/games`}>
									<div className={'grid grid-cols-3 gap-2'}>
										{games.slice(0, 6).map((game) => (
											<Link
												key={game.uri}
												href={`/game/${game.slug ?? game.uri}`}>
												<BoxArt
													className={'rounded-sm'}
													gameRecord={game}
												/>
											</Link>
										))}
									</div>
								</ProfileSidebarCard>
							)}
						</div>
					</div>
				</Container>
			</section>
		</div>
	)
}
