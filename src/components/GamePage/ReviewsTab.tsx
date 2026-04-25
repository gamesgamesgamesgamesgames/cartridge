import Link from 'next/link'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { getReviewerProfile, type ReviewerProfile } from '@/helpers/getReviewerProfile'
import { type PopfeedReview } from '@/helpers/lexicons/games/gamesgamesgamesgames/getReviews.defs'

const POPFEED_BASE = 'https://popfeed.social'

type Props = Readonly<{
	reviews: PopfeedReview[]
}>

function getPopfeedReviewUrl(atUri: string) {
	return `${POPFEED_BASE}/review/${atUri.replace('at://', 'at:/')}`
}

function getPopfeedProfileUrl(handle: string) {
	return `${POPFEED_BASE}/profile/${handle}`
}

function StarRating({ rating, compact }: { rating: number; compact?: boolean }) {
	const stars = rating / 2
	const fullStars = Math.floor(stars)
	const hasHalf = stars - fullStars >= 0.5

	return (
		<span className={`flex items-center gap-0.5 ${compact ? 'text-sm' : 'text-lg gap-1'}`}>
			{Array.from({ length: 5 }, (_, i) => {
				if (i < fullStars) return <span key={i}>{'★'}</span>
				if (i === fullStars && hasHalf) return <span key={i}>{'★'}</span>
				return (
					<span
						key={i}
						className={'opacity-30'}>
						{'★'}
					</span>
				)
			})}
			<span className={`ml-1 text-muted-foreground ${compact ? 'text-xs' : 'text-sm'}`}>{rating}/10</span>
		</span>
	)
}

function FullReviewCard(props: {
	review: PopfeedReview
	profile: ReviewerProfile
}) {
	const { review, profile } = props

	return (
		<div className={'mb-8 break-inside-avoid-column flex gap-3'}>
			<Link
				className={'shrink-0'}
				href={getPopfeedProfileUrl(profile.handle ?? review.did)}
				target={'_blank'}
				rel={'noopener noreferrer'}>
				<Avatar>
					{profile.avatarUrl && (
						<AvatarImage
							src={profile.avatarUrl}
							alt={profile.displayName ?? profile.handle}
						/>
					)}
					<AvatarFallback>
						{(profile.displayName ?? profile.handle ?? '?')
							.charAt(0)
							.toUpperCase()}
					</AvatarFallback>
				</Avatar>
			</Link>

			<div className={'flex flex-col gap-1 min-w-0 flex-1'}>
				<div className={'flex items-center justify-between'}>
					<Link
						className={'flex items-baseline gap-1.5 hover:opacity-80'}
						href={getPopfeedProfileUrl(profile.handle ?? review.did)}
						target={'_blank'}
						rel={'noopener noreferrer'}>
						{profile.displayName && (
							<span className={'text-sm font-medium'}>
								{profile.displayName}
							</span>
						)}
						{profile.handle && (
							<span className={'text-xs text-muted-foreground'}>
								@{profile.handle}
							</span>
						)}
					</Link>

					<Link
						className={'text-xs text-muted-foreground hover:underline shrink-0'}
						href={getPopfeedReviewUrl(review.uri)}
						target={'_blank'}
						rel={'noopener noreferrer'}>
						{new Date(review.createdAt).toLocaleDateString()}
					</Link>
				</div>

				<div className={'flex items-center gap-2'}>
					<StarRating rating={review.rating} />
					{review.containsSpoilers && (
						<Badge variant={'destructive'}>{'Spoilers'}</Badge>
					)}
				</div>

				{review.text && (
					<div className={'prose prose-sm dark:prose-invert max-w-none text-foreground'}>
						{review.text.split('\n').map((p, i) => (
							<p key={i}>{p}</p>
						))}
					</div>
				)}

				{Boolean(review.tags?.length) && (
					<div className={'flex flex-wrap gap-1 mt-1'}>
						{review.tags!.map((tag) => (
							<Badge
								key={tag}
								variant={'secondary'}>
								{tag}
							</Badge>
						))}
					</div>
				)}

				<Link
					className={'text-xs text-muted-foreground hover:underline mt-1 w-fit'}
					href={getPopfeedReviewUrl(review.uri)}
					target={'_blank'}
					rel={'noopener noreferrer'}>
					{'View on Popfeed'}
				</Link>
			</div>
		</div>
	)
}

function CompactReviewCard(props: {
	review: PopfeedReview
	profile: ReviewerProfile
}) {
	const { review, profile } = props

	return (
		<Link
			className={'flex items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2.5 transition-colors hover:bg-accent'}
			href={getPopfeedReviewUrl(review.uri)}
			target={'_blank'}
			rel={'noopener noreferrer'}>
			<Avatar className={'size-7'}>
				{profile.avatarUrl && (
					<AvatarImage
						src={profile.avatarUrl}
						alt={profile.displayName ?? profile.handle}
					/>
				)}
				<AvatarFallback className={'text-xs'}>
					{(profile.displayName ?? profile.handle ?? '?')
						.charAt(0)
						.toUpperCase()}
				</AvatarFallback>
			</Avatar>

			<div className={'flex min-w-0 flex-1 items-center justify-between gap-2'}>
				<span className={'truncate text-sm'}>
					{profile.displayName ?? `@${profile.handle}`}
				</span>
				<StarRating rating={review.rating} compact />
			</div>
		</Link>
	)
}

export async function ReviewsTab({ reviews }: Props) {
	if (!reviews.length) {
		return (
			<p className={'text-muted-foreground'}>
				{'No reviews yet. Be the first to review this game on Popfeed!'}
			</p>
		)
	}

	const uniqueDids = [...new Set(reviews.map((r) => r.did))]
	const profileEntries = await Promise.all(
		uniqueDids.map(async (did) => {
			const profile = await getReviewerProfile(did)
			return [did, profile] as const
		}),
	)
	const profiles = Object.fromEntries(profileEntries)

	const textReviews = reviews.filter((r) => r.text)
	const ratingOnlyReviews = reviews.filter((r) => !r.text)

	const hasText = textReviews.length > 0
	const hasRatingOnly = ratingOnlyReviews.length > 0

	// Only rating-only reviews: 3-column grid
	if (!hasText && hasRatingOnly) {
		return (
			<div className={'grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3'}>
				{ratingOnlyReviews.map((review) => (
					<CompactReviewCard
						key={review.uri}
						review={review}
						profile={profiles[review.did]}
					/>
				))}
			</div>
		)
	}

	// Only text reviews: 2 equal columns
	if (hasText && !hasRatingOnly) {
		return (
			<div className={'columns-1 gap-8 md:columns-2'}>
				{textReviews.map((review) => (
					<FullReviewCard
						key={review.uri}
						review={review}
						profile={profiles[review.did]}
					/>
				))}
			</div>
		)
	}

	// Mixed: text reviews at 70% left, rating-only stacked on right
	return (
		<div className={'flex flex-col gap-8 md:flex-row md:gap-12'}>
			<div className={'columns-1 md:w-[70%] md:shrink-0'}>
				{textReviews.map((review) => (
					<FullReviewCard
						key={review.uri}
						review={review}
						profile={profiles[review.did]}
					/>
				))}
			</div>

			<div className={'flex flex-1 flex-col gap-3'}>
				{ratingOnlyReviews.map((review) => (
					<CompactReviewCard
						key={review.uri}
						review={review}
						profile={profiles[review.did]}
					/>
				))}
			</div>
		</div>
	)
}
