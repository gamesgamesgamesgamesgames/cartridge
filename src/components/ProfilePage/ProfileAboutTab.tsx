// Module imports
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLink } from '@fortawesome/free-solid-svg-icons'

// Local imports
import { SectionHeader } from '@/components/GamePage/SectionHeader'
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
	// If we have a known type, use its config
	const typeConfig = type ? WEBSITE_TYPE_MAP.get(type) : undefined

	if (typeConfig) {
		return {
			icon: typeConfig.icon,
			label: extractDisplayValue(url, typeConfig),
		}
	}

	// Try to detect from URL
	const detected = detectFromUrl(url)
	if (detected) {
		return {
			icon: detected.type.icon,
			label: detected.username,
		}
	}

	// Fallback — strip protocol for display
	return {
		icon: faLink,
		label: url.replace(/^https?:\/\//, ''),
	}
}

export function ProfileAboutTab(props: Props) {
	const { profile } = props

	return (
		<>
			{Boolean(profile.description) && (
				<SectionHeader
					id={'about-description'}
					title={'Description'}>
					<div className={'flex flex-col gap-3 leading-7'}>
						{profile.description?.split('\n').map((p, index) => (
							<p key={index}>{p}</p>
						))}
					</div>
				</SectionHeader>
			)}

			{Boolean(profile.websites?.length) && (
				<SectionHeader
					id={'about-websites'}
					title={'Websites'}>
					<ul className={'flex flex-col gap-2'}>
						{profile.websites!.map((website) => {
							const { icon, label } = getWebsiteDisplay(website.url, website.type)

							return (
								<li
									key={website.url}
									className={'flex items-center gap-2'}>
									<FontAwesomeIcon
										icon={icon}
										className={'w-4 text-muted-foreground'}
										fixedWidth
									/>
									<a
										className={'text-primary hover:underline'}
										href={website.url}
										target={'_blank'}
										rel={'noopener noreferrer'}>
										{label}
									</a>
								</li>
							)
						})}
					</ul>
				</SectionHeader>
			)}
		</>
	)
}
