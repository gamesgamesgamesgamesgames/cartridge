// Local imports
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Container } from '@/components/Container/Container'
import { EditProfileButton } from '@/components/ProfilePage/EditProfileButton'
import { Header } from '@/components/Header/Header'
import { ProfileBioSection } from '@/components/ProfilePage/ProfileBioSection'
import { type ActorProfileDetailView } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'
import { type OrgProfileDetailView } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'

// Types
type ProfileStats = {
	games: number
	reviews: number
	likes: number
	lists: number
}

type Props = Readonly<{
	avatarUrl?: string
	handle: string
	profile: ActorProfileDetailView | OrgProfileDetailView
	stats: ProfileStats
}>

export type { ProfileStats }

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

function StatItem(props: { label: string; value: number }) {
	return (
		<div className={'flex flex-col items-center'}>
			<span className={'text-lg font-semibold'}>{props.value}</span>
			<span className={'text-xs text-muted-foreground'}>{props.label}</span>
		</div>
	)
}

export function ProfileBannerHeader(props: Props) {
	const { avatarUrl, handle, profile, stats } = props
	const displayName = profile.displayName ?? handle

	return (
		<section className={'relative overflow-hidden pb-24 pt-20 shadow-xl/30'}>
			<div
				className={'absolute inset-0 bg-gradient-to-br from-deep-navy to-primary/20'}
				aria-hidden
			/>

			<Container className={'relative z-10'} isScrollable={false}>
				<div className={'relative'}>
					<div className={'absolute top-0 right-0'}>
						<EditProfileButton profileDid={profile.did} />
					</div>

					<div className={'flex items-end gap-8'}>
						<Avatar className={'size-32 border-4 border-background shadow-lg'}>
							{avatarUrl && (
								<AvatarImage
									src={avatarUrl}
									alt={displayName}
								/>
							)}
							<AvatarFallback className={'text-4xl'}>
								{displayName.charAt(0).toUpperCase()}
							</AvatarFallback>
						</Avatar>

						<div className={'flex flex-1 flex-col gap-2 pb-1'}>
							<Header
								className={'text-4xl'}
								level={1}>
								{displayName}
							</Header>

							<div className={'flex items-center gap-3'}>
								<span className={'text-muted-foreground'}>
									{'@'}{handle}
								</span>

								{isActorProfile(profile) && profile.pronouns && (
									<span className={'text-sm text-muted-foreground'}>
										{'·'} {profile.pronouns}
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
											<span className={'text-sm text-muted-foreground'}>
												{profile.country}
											</span>
										)}
										{profile.foundedAt && (
											<span className={'text-sm text-muted-foreground'}>
												{'Founded '}{new Date(profile.foundedAt).getFullYear()}
											</span>
										)}
									</>
								)}
							</div>

							<div className={'mt-2 flex gap-6'}>
								<StatItem label={'Games'} value={stats.games} />
								<StatItem label={'Reviews'} value={stats.reviews} />
								<StatItem label={'Likes'} value={stats.likes} />
								<StatItem label={'Lists'} value={stats.lists} />
							</div>
						</div>
					</div>

					<div className={'mt-8'}>
						<ProfileBioSection profile={profile} />
					</div>
				</div>
			</Container>
		</section>
	)
}
