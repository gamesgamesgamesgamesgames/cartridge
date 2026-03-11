// Module imports
import { type PropsWithChildren } from 'react'

// Local imports
import { Container } from '@/components/Container/Container'
import { Header } from '@/components/Header/Header'
import {
	ProfilePageSubnav,
	type ProfileSubnavConfig,
} from '@/components/ProfilePage/ProfilePageSubnav'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { type ActorProfileDetailView } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'
import { type OrgProfileDetailView } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'
import { getBlobUrl } from '@/helpers/getBlobUrl'
import { resolvePds } from '@/helpers/resolvePds'

// Types
type Props = Readonly<
	PropsWithChildren<{
		basePath: string
		handle: string
		profile: ActorProfileDetailView | OrgProfileDetailView
		profileType: 'actor' | 'org'
	}>
>

function isActorProfile(profile: ActorProfileDetailView | OrgProfileDetailView): profile is ActorProfileDetailView {
	return profile.$type === 'games.gamesgamesgamesgames.defs#actorProfileDetailView'
}

function isOrgProfile(profile: ActorProfileDetailView | OrgProfileDetailView): profile is OrgProfileDetailView {
	return profile.$type === 'games.gamesgamesgamesgames.defs#orgProfileDetailView'
}

async function resolveAvatarUrl(
	profile: ActorProfileDetailView | OrgProfileDetailView,
	did: string,
): Promise<string | undefined> {
	try {
		const avatar = profile.avatar as
			| { ref?: { $link: string } | string | unknown }
			| undefined
		if (!avatar) return undefined

		const ref = avatar.ref
		if (!ref) return undefined

		let cid: string
		if (typeof ref === 'string') {
			cid = ref
		} else if (typeof ref === 'object' && ref !== null && '$link' in (ref as Record<string, unknown>)) {
			cid = (ref as { $link: string }).$link
		} else {
			cid = String(ref)
		}

		if (!cid) return undefined

		const pdsEndpoint = await resolvePds(did)
		return getBlobUrl(pdsEndpoint, did, cid)
	} catch {
		return undefined
	}
}

export async function ProfileLayoutContent(props: Props) {
	const { basePath, children, handle, profile, profileType } = props

	const did = profile.did
	const avatarUrl = await resolveAvatarUrl(profile, did)

	const aboutSections: ProfileSubnavConfig['about'] = []
	if (profile.description) {
		aboutSections.push({ id: 'about-description', label: 'Description' })
	}
	if (profile.websites?.length) {
		aboutSections.push({ id: 'about-websites', label: 'Websites' })
	}

	const subnavConfig: ProfileSubnavConfig = {
		about: aboutSections,
		reviews: [],
	}

	const displayName = profile.displayName ?? handle

	return (
		<div className={'flex min-h-screen flex-col'}>
			<section className={'relative overflow-hidden py-20 shadow-xl/30'}>
				<Container className={'relative z-10'}>
					<div className={'flex gap-10 items-center'}>
						<Avatar className={'size-32'}>
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

						<div className={'flex flex-col gap-3'}>
							<Header
								className={'text-5xl'}
								level={2}>
								{displayName}
							</Header>

							<span className={'text-muted-foreground'}>
								{'@'}{handle}
							</span>

							{isActorProfile(profile) && profile.pronouns && (
								<span className={'text-sm text-muted-foreground'}>
									{profile.pronouns}
								</span>
							)}

							{isOrgProfile(profile) && (
								<div className={'flex items-center gap-3'}>
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
								</div>
							)}
						</div>
					</div>
				</Container>
			</section>

			<section className={'flex-1 bg-secondary py-20'}>
				<Container className={'overflow-visible'}>
					<div className={'flex gap-20'}>
						<div className={'sticky top-20 self-start'}>
							<ProfilePageSubnav
								basePath={basePath}
								subnavConfig={subnavConfig}
							/>
						</div>

						<div className={'flex flex-1 flex-col gap-10'}>{children}</div>
					</div>
				</Container>
			</section>
		</div>
	)
}
