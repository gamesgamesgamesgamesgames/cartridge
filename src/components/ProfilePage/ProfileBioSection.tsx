// Module imports
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLink } from '@fortawesome/free-solid-svg-icons'

// Local imports
import {
	detectFromUrl,
	extractDisplayValue,
	WEBSITE_TYPE_MAP,
} from '@/constants/WEBSITE_TYPES'
import { type ActorProfileDetailView } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'
import { type OrgProfileDetailView } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'

// Types
type Props = Readonly<{
	profile: ActorProfileDetailView | OrgProfileDetailView
}>

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

export function ProfileBioSection(props: Props) {
	const { profile } = props

	const hasDescription = Boolean(profile.description)
	const hasWebsites = Boolean(profile.websites?.length)

	if (!hasDescription && !hasWebsites) return null

	return (
		<section className={'flex flex-col gap-4'}>
			{hasDescription && (
				<div className={'leading-7 text-foreground'}>
					{profile.description!.split('\n').map((p, index) => (
						<p key={index} className={'mb-2 last:mb-0'}>{p}</p>
					))}
				</div>
			)}

			{hasWebsites && (
				<div className={'flex flex-wrap items-center gap-x-4 gap-y-2'}>
					{profile.websites!.map((website) => {
						const { icon, label } = getWebsiteDisplay(website.url, website.type)

						return (
							<a
								key={website.url}
								className={'flex items-center gap-1.5 text-sm text-primary hover:underline'}
								href={website.url}
								target={'_blank'}
								rel={'noopener noreferrer'}>
								<FontAwesomeIcon
									icon={icon}
									className={'w-3.5 text-muted-foreground'}
									fixedWidth
								/>
								{label}
							</a>
						)
					})}
				</div>
			)}
		</section>
	)
}
