import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLink } from '@fortawesome/free-solid-svg-icons'
import { Compass } from 'lucide-react'
import Link from 'next/link'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { BoxArt } from '@/components/BoxArt/BoxArt'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/Container/Container'
import { EditProfileButton } from '@/components/ProfilePage/EditProfileButton'
import { FollowButton } from '@/components/ProfilePage/FollowButton'
import { Header } from '@/components/Header/Header'
import {
	detectFromUrl,
	extractDisplayValue,
	WEBSITE_TYPE_MAP,
} from '@/constants/WEBSITE_TYPES'
import { type ActorProfileDetailView } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'
import { type OrgProfileDetailView } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'
import { VerifiedBadge } from '@/components/VerifiedBadge/VerifiedBadge'
import { type GameFeedGame, type GenrePreference } from '@/helpers/API'

type Props = Readonly<{
	avatarUrl?: string
	favorites: GameFeedGame[]
	followerCount: number
	followingCount: number
	genres: GenrePreference[]
	handle: string
	isFollowedBy: boolean
	isFollowing: boolean
	isOwnProfile: boolean
	profile: ActorProfileDetailView | OrgProfileDetailView
	verifiedAccountType?: 'studio' | 'developer' | 'publisher'
}>

function isActorProfile(
	profile: ActorProfileDetailView | OrgProfileDetailView,
): profile is ActorProfileDetailView {
	return profile.$type === 'games.gamesgamesgamesgames.defs#actorProfileDetailView'
}

function isOrgProfile(
	profile: ActorProfileDetailView | OrgProfileDetailView,
): profile is OrgProfileDetailView {
	return profile.$type === 'games.gamesgamesgamesgames.defs#orgProfileDetailView'
}

function formatCount(n: number): string {
	if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
	if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
	return String(n)
}

function getWebsiteDisplay(url: string, type?: string) {
	const typeConfig = type ? WEBSITE_TYPE_MAP.get(type) : undefined

	if (typeConfig) {
		return {
			icon: typeConfig.icon,
			label: extractDisplayValue(url, typeConfig),
		}
	}

	const detected = detectFromUrl(url)
	if (detected) {
		return {
			icon: detected.type.icon,
			label: detected.username,
		}
	}

	return {
		icon: faLink,
		label: url.replace(/^https?:\/\//, ''),
	}
}

function GenreBar(props: { genre: string; percentage: number; isOwnProfile: boolean }) {
	const { genre, percentage, isOwnProfile } = props

	const bar = (
		<div className={'flex items-center gap-3'}>
			<span className={'w-24 shrink-0 truncate text-sm text-foreground'}>
				{genre}
			</span>
			<div className={'relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted'}>
				<div
					className={'h-full rounded-full bg-primary'}
					style={{ width: `${percentage}%` }}
				/>
			</div>
			<span className={'w-8 shrink-0 text-right text-xs text-muted-foreground'}>
				{percentage}{'%'}
			</span>
		</div>
	)

	if (isOwnProfile) {
		return (
			<Link
				href={`/browse?genre=${encodeURIComponent(genre)}`}
				className={'-mx-2 rounded-md px-2 py-1 outline-none transition-colors hover:bg-muted/50 focus-visible:ring-[3px] focus-visible:ring-ring/50'}>
				{bar}
			</Link>
		)
	}

	return bar
}

export function ProfileHeader(props: Props) {
	const {
		avatarUrl,
		favorites,
		followerCount,
		followingCount,
		genres,
		handle,
		isFollowedBy,
		isFollowing,
		isOwnProfile,
		profile,
		verifiedAccountType,
	} = props

	const displayName = profile.displayName ?? handle
	const hasDescription = Boolean(profile.description)
	const hasWebsites = Boolean(profile.websites?.length)
	const displayGenres = genres.slice(0, 5)
	const hasTaste = displayGenres.length > 0 || favorites.length > 0
	const tasteSummary = buildTasteSummary(genres)

	return (
		<section className={'border-b border-border bg-gradient-to-b from-card to-background'} aria-label={'Profile'}>
			<Container className={'overflow-visible'} isScrollable={false}>
				{/* Identity row */}
				<div className={'flex items-start gap-5 pt-8'}>
					<Avatar className={'size-20 shrink-0 border-2 border-primary/20 shadow-lg sm:size-24'}>
						{avatarUrl && (
							<AvatarImage
								src={avatarUrl}
								alt={displayName}
							/>
						)}
						<AvatarFallback className={'text-3xl font-semibold'}>
							{displayName.charAt(0).toUpperCase()}
						</AvatarFallback>
					</Avatar>

					<div className={'flex min-w-0 flex-1 flex-col gap-2'}>
						<div className={'flex items-start justify-between gap-4'}>
							<div className={'min-w-0'}>
								<Header
									className={'truncate text-2xl sm:text-3xl'}
									level={1}
									title={displayName}>
									{displayName}
									{verifiedAccountType && (
										<VerifiedBadge
											accountType={verifiedAccountType}
											className={'ml-2 inline-block align-middle text-[0.5em]'}
										/>
									)}
								</Header>

								<div className={'mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1'}>
									<span className={'text-sm text-muted-foreground'}>
										{'@'}{handle}
									</span>

									{isActorProfile(profile) && profile.pronouns && (
										<span className={'text-xs text-muted-foreground'}>
											{profile.pronouns}
										</span>
									)}

									{isOrgProfile(profile) && (
										<>
											{profile.status && (
												<Badge variant={profile.status === 'active' ? 'default' : 'secondary'}>
													{profile.status.charAt(0).toUpperCase() + profile.status.slice(1)}
												</Badge>
											)}
											{profile.country && (
												<span className={'text-xs text-muted-foreground'}>
													{profile.country}
												</span>
											)}
											{profile.foundedAt && (
												<span className={'text-xs text-muted-foreground'}>
													{'Founded '}{new Date(profile.foundedAt).getFullYear()}
												</span>
											)}
										</>
									)}

									{isFollowedBy && isFollowing && (
										<Badge variant={'secondary'} className={'text-xs'}>
											{'Mutual'}
										</Badge>
									)}
								</div>
							</div>

							<div className={'shrink-0'}>
								<EditProfileButton profileDid={profile.did} />
								<FollowButton
									profileDid={profile.did}
									initialIsFollowing={isFollowing}
									initialIsFollowedBy={isFollowedBy}
									initialFollowerCount={followerCount}
								/>
							</div>
						</div>

						<div className={'flex items-center gap-4 text-sm'} role={'group'} aria-label={'Social stats'}>
							<span>
								<span className={'font-semibold text-foreground'}>{formatCount(followingCount)}</span>
								{' '}
								<span className={'text-muted-foreground'}>{'following'}</span>
							</span>
							<span>
								<span className={'font-semibold text-foreground'}>{formatCount(followerCount)}</span>
								{' '}
								<span className={'text-muted-foreground'}>
									{followerCount === 1 ? 'follower' : 'followers'}
								</span>
							</span>
						</div>
					</div>
				</div>

				{/* Bio + websites */}
				{(hasDescription || hasWebsites) && (
					<div className={'mt-4 flex flex-col gap-3 pl-0 sm:pl-[calc(6rem+1.25rem)]'}>
						{hasDescription && (
							<p className={'max-w-prose break-words text-pretty text-sm leading-relaxed text-foreground'}>
								{profile.description}
							</p>
						)}

						{hasWebsites && (
							<div className={'flex flex-wrap items-center gap-x-4 gap-y-1.5'}>
								{profile.websites!.map((website) => {
									const { icon, label } = getWebsiteDisplay(website.url, website.type)
									return (
										<a
											key={website.url}
											className={'flex max-w-48 items-center gap-1.5 text-sm text-primary hover:underline'}
											href={website.url}
											target={'_blank'}
											rel={'noopener noreferrer'}
											aria-label={`${label} (opens in new tab)`}>
											<FontAwesomeIcon
												icon={icon}
												className={'w-3.5 shrink-0 text-muted-foreground'}
												fixedWidth
											/>
											<span className={'truncate'}>{label}</span>
										</a>
									)
								})}
							</div>
						)}
					</div>
				)}

				{/* Taste section (integrated into header) */}
				{hasTaste ? (
					<div
						className={'mt-6 border-t border-border/50 pb-6 pt-5'}
						aria-label={'Taste profile'}>
						{tasteSummary && (
							<p className={'mb-4 text-sm text-muted-foreground'}>
								{tasteSummary}
							</p>
						)}

						{displayGenres.length > 0 ? (
							<div className={'flex flex-col gap-8 lg:flex-row lg:gap-12'}>
								<div className={'flex min-w-0 flex-1 flex-col gap-2'} role={'list'} aria-label={'Genre preferences'}>
									{displayGenres.map((g) => (
										<div key={g.genre} role={'listitem'}>
											<GenreBar
												genre={g.genre}
												percentage={g.percentage}
												isOwnProfile={isOwnProfile}
											/>
										</div>
									))}
								</div>

								{favorites.length > 0 && (
									<div className={'flex flex-col gap-2 lg:w-72'}>
										<h3 className={'text-xs font-medium text-muted-foreground'}>
											{'Favorites'}
										</h3>
										<div className={'grid gap-1.5'} style={{ gridTemplateColumns: `repeat(${Math.min(favorites.length, 3)}, 1fr)` }}>
											{favorites.slice(0, 6).map((game) => (
												<Link
													key={game.uri}
													href={`/game/${game.slug ?? game.uri}`}
													className={'group'}>
													<BoxArt
														className={'rounded-md transition-transform motion-safe:group-hover:scale-105'}
														gameRecord={game}
													/>
												</Link>
											))}
										</div>
									</div>
								)}
							</div>
						) : (
							<div>
								<h3 className={'mb-3 text-xs font-medium text-muted-foreground'}>
									{'Favorites'}
								</h3>
								<div className={'flex gap-2 overflow-x-auto pb-1'}>
									{favorites.slice(0, 8).map((game) => (
										<Link
											key={game.uri}
											href={`/game/${game.slug ?? game.uri}`}
											className={'group shrink-0'}>
											<BoxArt
												className={'w-20 rounded-md transition-transform motion-safe:group-hover:scale-105'}
												gameRecord={game}
											/>
										</Link>
									))}
								</div>
							</div>
						)}
					</div>
				) : (
					<div className={'border-t border-border/50 pb-6 pt-5'}>
						{isOwnProfile ? (
							<div className={'flex flex-col items-center gap-3 py-2'}>
								<div className={'flex size-10 items-center justify-center rounded-lg bg-muted'}>
									<Compass className={'size-5 text-muted-foreground'} aria-hidden={'true'} />
								</div>
								<div className={'flex flex-col items-center gap-1 text-center'}>
									<p className={'text-sm font-medium text-foreground'}>
										{'Your taste profile builds as you go'}
									</p>
									<p className={'max-w-xs text-sm text-muted-foreground'}>
										{'Like and review games to see your top genres and favorites here.'}
									</p>
								</div>
								<Button asChild variant={'outline'} size={'sm'}>
									<Link href={'/browse'}>
										{'Browse games'}
									</Link>
								</Button>
							</div>
						) : (
							<p className={'py-2 text-center text-sm text-muted-foreground'}>
								{'New to Cartridge'}
							</p>
						)}
					</div>
				)}
			</Container>
		</section>
	)
}

function buildTasteSummary(genres: GenrePreference[]): string | null {
	if (genres.length === 0) return null

	const top = genres.slice(0, 3).map((g) => g.genre)

	if (top.length === 1) return `Mostly into ${top[0]}.`
	if (top.length === 2) return `Mostly into ${top[0]} and ${top[1]}.`
	return `Mostly into ${top[0]}, ${top[1]}, and ${top[2]}.`
}
