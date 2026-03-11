// Local imports
import { SectionHeader } from '@/components/GamePage/SectionHeader'
import { type ActorProfileDetailView } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'
import { type OrgProfileDetailView } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'

// Types
type Props = Readonly<{
	profile: ActorProfileDetailView | OrgProfileDetailView
}>

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
						{profile.websites!.map((website) => (
							<li key={website.url}>
								<a
									className={'text-primary hover:underline'}
									href={website.url}
									target={'_blank'}
									rel={'noopener noreferrer'}>
									{website.url}
								</a>
								{website.type && (
									<span className={'ml-2 text-sm text-muted-foreground'}>
										{'('}{website.type}{')'}
									</span>
								)}
							</li>
						))}
					</ul>
				</SectionHeader>
			)}
		</>
	)
}
