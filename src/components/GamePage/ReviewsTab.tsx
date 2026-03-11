// Module imports
import Link from 'next/link'

// Local imports
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/Header/Header'
import { getReviewerProfile } from '@/helpers/getReviewerProfile'
import { type PopfeedReview } from '@/helpers/lexicons/games/gamesgamesgamesgames/getReviews.defs'

// Constants
const POPFEED_BASE = 'https://popfeed.social'

// Types
type Props = Readonly<{
	reviews: PopfeedReview[]
}>

function getPopfeedReviewUrl(atUri: string) {
	return `${POPFEED_BASE}/review/${atUri.replace('at://', 'at:/')}`
}

function getPopfeedProfileUrl(handle: string) {
	return `${POPFEED_BASE}/profile/${handle}`
}

function StarRating({ rating }: { rating: number }) {
	const stars = rating / 2
	const fullStars = Math.floor(stars)
	const hasHalf = stars - fullStars >= 0.5

	return (
		<span className={'flex items-center gap-1 text-lg'}>
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
			<span className={'ml-1 text-sm text-muted-foreground'}>{rating}/10</span>
		</span>
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

	return (
		<div className={'flex flex-col'}>
			{reviews.map((review, index) => {
				const profile = profiles[review.did]

				return (
					<div
						key={review.uri}
						className={`flex gap-3 py-4 ${index < reviews.length - 1 ? 'border-b border-border' : ''}`}>
						<Link
							className={'shrink-0'}
							href={getPopfeedProfileUrl(profile?.handle ?? review.did)}
							target={'_blank'}
							rel={'noopener noreferrer'}>
							<Avatar>
								{profile?.avatarUrl && (
									<AvatarImage
										src={profile.avatarUrl}
										alt={profile.displayName ?? profile.handle}
									/>
								)}
								<AvatarFallback>
									{(profile?.displayName ?? profile?.handle ?? '?')
										.charAt(0)
										.toUpperCase()}
								</AvatarFallback>
							</Avatar>
						</Link>

						<div className={'flex flex-col gap-1 min-w-0 flex-1'}>
							<div className={'flex items-center justify-between'}>
								<Link
									className={'flex items-baseline gap-1.5 hover:opacity-80'}
									href={getPopfeedProfileUrl(profile?.handle ?? review.did)}
									target={'_blank'}
									rel={'noopener noreferrer'}>
									{profile?.displayName && (
										<span className={'text-sm font-medium'}>
											{profile.displayName}
										</span>
									)}
									{profile?.handle && (
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

							{review.title && <Header level={4}>{review.title}</Header>}

							{review.text && (
								<div className={'prose prose-sm dark:prose-invert max-w-none text-muted-foreground'}>
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
			})}
		</div>
	)
}
