// Local imports
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Container } from '@/components/Container/Container'
import { GameTabPanel } from '@/components/GamePage/GameTabPanel'
import { GameTabs } from '@/components/GamePage/GameTabs'
import { Header } from '@/components/Header/Header'
import { OrgCreditsFeed } from '@/components/OrgProfilePage/OrgCreditsFeed'
import { ProfileAboutTab } from '@/components/ProfilePage/ProfileAboutTab'
import { EditProfileButton } from '@/components/ProfilePage/EditProfileButton'
import { getBlobUrl } from '@/helpers/getBlobUrl'
import { resolvePds } from '@/helpers/resolvePds'
import { type OrgProfileDetailView } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'

// Types
type Props = Readonly<{
	handle: string
	profile: OrgProfileDetailView
}>

async function resolveAvatarUrl(
	profile: OrgProfileDetailView,
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

export async function OrgProfileLayoutContent(props: Props) {
	const { handle, profile } = props

	const did = profile.did
	const avatarUrl = await resolveAvatarUrl(profile, did)
	const displayName = profile.displayName ?? handle

	const tabs: { id: string; label: string }[] = [
		{ id: 'about', label: 'About' },
		{ id: 'developed', label: 'Developed' },
		{ id: 'published', label: 'Published' },
	]

	return (
		<div className={'flex min-h-screen flex-col'}>
			<section className={'relative overflow-hidden py-10 md:py-20 shadow-xl/30'}>
				<Container className={'relative z-10'}>
					<div className={'relative'}>
						<div className={'absolute top-0 right-0'}>
							<EditProfileButton profileDid={did} />
						</div>

						<div className={'flex flex-col items-center gap-6 md:flex-row md:items-center md:gap-10'}>
							<Avatar className={'size-32 md:size-40'}>
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

							<div className={'flex flex-col gap-3 text-center md:text-left'}>
								<Header
									className={'text-3xl md:text-5xl'}
									level={2}>
									{displayName}
								</Header>

								<span className={'text-muted-foreground'}>
									{'@'}{handle}
								</span>

								<div className={'flex items-center justify-center gap-3 md:justify-start'}>
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
							</div>
						</div>
					</div>
				</Container>
			</section>

			<div className={'bg-secondary flex flex-grow flex-col gap-10 py-10 md:gap-20 md:py-20'}>
				<section>
					<Container>
						<GameTabs tabs={tabs}>
							<GameTabPanel tab="about">
								<ProfileAboutTab profile={profile} />
							</GameTabPanel>

							<GameTabPanel tab="developed">
								<OrgCreditsFeed
									orgUri={profile.uri}
									role="developer"
									emptyMessage="No development credits found."
								/>
							</GameTabPanel>

							<GameTabPanel tab="published">
								<OrgCreditsFeed
									orgUri={profile.uri}
									role="publisher"
									emptyMessage="No publishing credits found."
								/>
							</GameTabPanel>
						</GameTabs>
					</Container>
				</section>
			</div>
		</div>
	)
}
