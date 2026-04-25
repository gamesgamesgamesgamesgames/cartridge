import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLink } from '@fortawesome/free-solid-svg-icons'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Container } from '@/components/Container/Container'
import { Header } from '@/components/Header/Header'
import { OrgGameSections } from '@/components/CompanyPage/OrgGameSections'
import {
	detectFromUrl,
	extractDisplayValue,
	WEBSITE_TYPE_MAP,
} from '@/constants/WEBSITE_TYPES'
import { type OrgProfile } from '@/helpers/getOrgByUri'

type Props = Readonly<{
	org: OrgProfile
}>

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
	active: 'default',
	inactive: 'secondary',
	merged: 'outline',
	acquired: 'outline',
	defunct: 'destructive',
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

export function CompanyPageContent(props: Props) {
	const { org } = props

	const displayName = org.displayName ?? 'Unknown Company'
	const hasDescription = Boolean(org.description)
	const hasWebsites = Boolean(org.websites?.length)

	return (
		<div className={'flex min-h-screen flex-col'}>
			{/* Hero */}
			<section className={'relative overflow-hidden py-12 shadow-xl/30 md:py-20'}>
				<Container className={'relative z-10'}>
					<div className={'flex flex-col items-center gap-8 md:flex-row md:items-start md:gap-14'}>
						<Avatar className={'size-36 shadow-2xl ring-4 ring-border/50 md:size-44'}>
							{org.avatarUrl && (
								<AvatarImage
									src={org.avatarUrl}
									alt={displayName}
								/>
							)}
							<AvatarFallback className={'text-5xl'}>
								{displayName.charAt(0).toUpperCase()}
							</AvatarFallback>
						</Avatar>

						<div className={'flex flex-col gap-5 text-center md:text-left'}>
							<Header
								className={'text-3xl md:text-5xl'}
								level={2}>
								{displayName}
							</Header>

							<div className={'flex flex-wrap items-center justify-center gap-3 md:justify-start'}>
								{org.status && (
									<Badge variant={STATUS_VARIANTS[org.status] ?? 'secondary'}>
										{org.status.charAt(0).toUpperCase() + org.status.slice(1)}
									</Badge>
								)}
								{org.foundedAt && (
									<span className={'text-sm text-muted-foreground'}>
										{'Founded '}{new Date(org.foundedAt).getFullYear()}
									</span>
								)}
								{org.country && (
									<span className={'text-sm text-muted-foreground'}>
										{org.country}
									</span>
								)}
							</div>

							{hasDescription && (
								<div className={'prose prose-sm dark:prose-invert max-w-2xl text-foreground'}>
									{org.description!.split('\n').map((p, index) => (
										<p key={index}>{p}</p>
									))}
								</div>
							)}

							{hasWebsites && (
								<div className={'flex flex-wrap items-center justify-center gap-2 md:justify-start'}>
									{org.websites!.map((website, index) => {
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
				</Container>
			</section>

			{/* Content */}
			<div className={'flex flex-grow flex-col bg-secondary py-12 md:py-20'}>
				<OrgGameSections orgUri={org.uri} />
			</div>
		</div>
	)
}
