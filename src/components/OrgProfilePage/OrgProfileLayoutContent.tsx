import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLink } from '@fortawesome/free-solid-svg-icons'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Container } from '@/components/Container/Container'
import { Header } from '@/components/Header/Header'
import { OrgGameSections } from '@/components/CompanyPage/OrgGameSections'
import { EditProfileButton } from '@/components/ProfilePage/EditProfileButton'
import {
	detectFromUrl,
	extractDisplayValue,
	WEBSITE_TYPE_MAP,
} from '@/constants/WEBSITE_TYPES'
import { getBlobUrl } from '@/helpers/getBlobUrl'
import { resolvePds } from '@/helpers/resolvePds'
import { type OrgProfileDetailView } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'

type Props = Readonly<{
	handle: string
	profile: OrgProfileDetailView
}>

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
	active: 'default',
	inactive: 'secondary',
	merged: 'outline',
	acquired: 'outline',
	defunct: 'destructive',
}

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

export async function OrgProfileLayoutContent(props: Props) {
	const { handle, profile } = props

	const did = profile.did
	const avatarUrl = await resolveAvatarUrl(profile, did)
	const displayName = profile.displayName ?? handle

	const hasDescription = Boolean(profile.description)
	const hasWebsites = Boolean(profile.websites?.length)
	const hasMeta = Boolean(profile.country) || Boolean(profile.foundedAt)

	return (
		<div className={'flex min-h-screen flex-col'}>
			{/* Hero */}
			<section className={'relative overflow-hidden py-12 shadow-xl/30 md:py-20'}>
				<Container className={'relative z-10'}>
					<div className={'relative'}>
						<div className={'absolute right-0 top-0'}>
							<EditProfileButton profileDid={did} />
						</div>

						<div className={'flex flex-col items-center gap-8 md:flex-row md:items-start md:gap-14'}>
							<Avatar className={'size-36 shadow-2xl ring-4 ring-border/50 md:size-44'}>
								{avatarUrl && (
									<AvatarImage
										src={avatarUrl}
										alt={displayName}
									/>
								)}
								<AvatarFallback className={'text-5xl'}>
									{displayName.charAt(0).toUpperCase()}
								</AvatarFallback>
							</Avatar>

							<div className={'flex flex-col gap-5 text-center md:text-left'}>
								<div>
									<Header
										className={'text-3xl md:text-5xl'}
										level={2}>
										{displayName}
									</Header>
									<span className={'mt-1.5 block text-muted-foreground'}>
										{'@'}{handle}
									</span>
								</div>

								<div className={'flex flex-wrap items-center justify-center gap-3 md:justify-start'}>
									{profile.status && (
										<Badge variant={STATUS_VARIANTS[profile.status] ?? 'secondary'}>
											{profile.status.charAt(0).toUpperCase() + profile.status.slice(1)}
										</Badge>
									)}
									{profile.foundedAt && (
										<span className={'text-sm text-muted-foreground'}>
											{'Founded '}{new Date(profile.foundedAt).getFullYear()}
										</span>
									)}
									{profile.country && (
										<span className={'text-sm text-muted-foreground'}>
											{profile.country}
										</span>
									)}
								</div>

								{hasDescription && (
									<div className={'prose prose-sm dark:prose-invert max-w-2xl text-foreground'}>
										{profile.description!.split('\n').map((p, index) => (
											<p key={index}>{p}</p>
										))}
									</div>
								)}

								{hasWebsites && (
									<div className={'flex flex-wrap items-center justify-center gap-2 md:justify-start'}>
										{profile.websites!.map((website, index) => {
											const { icon, label } = getWebsiteDisplay(website.url, website.type)

											return (
												<a
													key={index}
													href={website.url}
													target={'_blank'}
													rel={'noopener noreferrer'}
													className={'flex items-center gap-1.5 rounded-full border border-border bg-card/50 px-3 py-1 text-xs transition-colors hover:bg-accent'}>
													<FontAwesomeIcon
														icon={icon}
														className={'size-3 text-muted-foreground'}
														fixedWidth
													/>
													<span>{label}</span>
												</a>
											)
										})}
									</div>
								)}
							</div>
						</div>
					</div>
				</Container>
			</section>

			{/* Content */}
			<div className={'flex flex-grow flex-col bg-secondary py-12 md:py-20'}>
				<OrgGameSections orgUri={profile.uri} />
			</div>
		</div>
	)
}
