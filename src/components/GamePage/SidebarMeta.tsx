import Link from 'next/link'

import { CopyableValue } from '@/components/GamePage/CopyableValue'
import { Header } from '@/components/Header/Header'
import { type GameRecord } from '@/typedefs/GameRecord'
import {
	type CompanyRole,
	type OrgCreditView,
} from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'

const COMPANY_ROLE_LABELS: Record<string, string> = {
	developer: 'Developer',
	publisher: 'Publisher',
	porter: 'Porter',
	supporter: 'Supporter',
}

const EXTERNAL_ID_LABELS: Record<string, string> = {
	igdb: 'IGDB',
	steam: 'Steam',
	gog: 'GOG',
	epicGames: 'Epic Games',
	itchIo: 'itch.io',
	humbleBundle: 'Humble Bundle',
	playStation: 'PlayStation',
	xbox: 'Xbox',
	nintendoEshop: 'Nintendo eShop',
	appleAppStore: 'App Store',
	googlePlay: 'Google Play',
}

const WEBSITE_TYPE_LABELS: Record<string, string> = {
	official: 'Official Website',
	wiki: 'Wiki',
	steam: 'Steam',
	gog: 'GOG',
	epicGames: 'Epic Games',
	itchIo: 'itch.io',
	twitter: 'Twitter',
	instagram: 'Instagram',
	youtube: 'YouTube',
	twitch: 'Twitch',
	discord: 'Discord',
	reddit: 'Reddit',
	facebook: 'Facebook',
	wikipedia: 'Wikipedia',
	bluesky: 'Bluesky',
	xbox: 'Xbox',
	playstation: 'PlayStation',
	nintendo: 'Nintendo',
	meta: 'Meta',
	other: 'Other',
}

const STORE_TYPES = new Set([
	'steam', 'gog', 'epicGames', 'itchIo', 'xbox', 'playstation', 'nintendo', 'meta',
])

const SOCIAL_TYPES = new Set([
	'twitter', 'instagram', 'youtube', 'twitch', 'discord', 'reddit', 'facebook', 'bluesky',
])

function getCompanyRoleLabel(role: CompanyRole): string {
	return COMPANY_ROLE_LABELS[role] ?? role
}

type Props = Readonly<{
	gameRecord: GameRecord
	orgCredits?: OrgCreditView[]
}>

export function SidebarMeta(props: Props) {
	const { gameRecord, orgCredits } = props
	const externalIds = gameRecord.externalIds
	const websites = gameRecord.websites ?? []

	const stores = websites.filter((w) => STORE_TYPES.has(w.type ?? ''))
	const socials = websites.filter((w) => SOCIAL_TYPES.has(w.type ?? ''))
	const otherLinks = websites.filter(
		(w) => !STORE_TYPES.has(w.type ?? '') && !SOCIAL_TYPES.has(w.type ?? ''),
	)

	const hasExternalIds = externalIds && Object.entries(externalIds).some(([k, v]) => k !== '$type' && v != null)

	return (
		<>
			{/* Companies */}
			{orgCredits && orgCredits.length > 0 && (
				<div>
					<Header className={'mb-4 text-base md:text-sm'} level={5}>{'Companies'}</Header>
					<div className={'flex flex-col gap-4'}>
						{orgCredits.map((org) => {
							const rkey = org.orgUri?.split('/').pop()
							return (
								<div key={org.uri} className={'flex flex-col gap-1'}>
									{rkey ? (
										<Link
											href={`/company/${rkey}`}
											className={'text-sm font-medium text-primary hover:underline'}>
											{org.displayName ?? 'Unknown'}
										</Link>
									) : (
										<span className={'text-sm font-medium'}>
											{org.displayName ?? 'Unknown'}
										</span>
									)}
									<div className={'flex flex-wrap gap-1'}>
										{org.roles.map((role) => (
											<span
												key={role}
												className={'rounded-full bg-muted px-2 py-0.5 text-xs'}>
												{getCompanyRoleLabel(role)}
											</span>
										))}
									</div>
								</div>
							)
						})}
					</div>
				</div>
			)}

			{/* Stores */}
			{stores.length > 0 && (
				<div>
					<Header className={'mb-4 text-base md:text-sm'} level={5}>{'Where to Buy'}</Header>
					<div className={'flex flex-col gap-2.5'}>
						{stores.map((website, index) => (
							<a
								key={index}
								href={website.url}
								target={'_blank'}
								rel={'noopener noreferrer'}
								className={'flex items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-sm transition-colors hover:bg-accent'}>
								<span>{WEBSITE_TYPE_LABELS[website.type ?? 'other'] ?? website.type}</span>
								<span className={'text-muted-foreground'}>{'→'}</span>
							</a>
						))}
					</div>
				</div>
			)}

			{/* Official + Other Links */}
			{otherLinks.length > 0 && (
				<div>
					<Header className={'mb-4 text-base md:text-sm'} level={5}>{'Links'}</Header>
					<div className={'flex flex-col gap-2'}>
						{otherLinks.map((website, index) => (
							<a
								key={index}
								href={website.url}
								target={'_blank'}
								rel={'noopener noreferrer'}
								className={'text-sm text-primary underline hover:no-underline'}>
								{WEBSITE_TYPE_LABELS[website.type ?? 'other'] ?? website.type}
							</a>
						))}
					</div>
				</div>
			)}

			{/* Socials */}
			{socials.length > 0 && (
				<div>
					<Header className={'mb-4 text-base md:text-sm'} level={5}>{'Socials'}</Header>
					<div className={'flex flex-wrap gap-2.5'}>
						{socials.map((website, index) => (
							<a
								key={index}
								href={website.url}
								target={'_blank'}
								rel={'noopener noreferrer'}
								className={'rounded-md border border-border bg-card px-2.5 py-1 text-xs transition-colors hover:bg-accent'}>
								{WEBSITE_TYPE_LABELS[website.type ?? 'other'] ?? website.type}
							</a>
						))}
					</div>
				</div>
			)}

			{/* External IDs */}
			{hasExternalIds && (
				<div>
					<Header className={'mb-4 text-base md:text-sm'} level={5}>{'External IDs'}</Header>
					<div className={'flex flex-col gap-1 text-sm'}>
						{Object.entries(externalIds).map(([key, value]) => {
							if (key === '$type' || value == null) return null
							const label = EXTERNAL_ID_LABELS[key] ?? key

							if (key === 'itchIo' && typeof value === 'object') {
								const itchIo = value as { developer?: string; game?: string }
								return (
									<CopyableValue
										key={key}
										label={'itch.io'}
										value={`${itchIo.developer}/${itchIo.game}`}
									/>
								)
							}

							return (
								<CopyableValue
									key={key}
									label={label}
									value={String(value)}
								/>
							)
						})}
					</div>
				</div>
			)}

			{/* Language Support */}
			{Boolean(gameRecord.languageSupports?.length) && (
				<div>
					<Header className={'mb-4 text-base md:text-sm'} level={5}>{'Languages'}</Header>
					<div className={'flex flex-wrap gap-2'}>
						{gameRecord.languageSupports!.map((ls, index) => (
							<span
								key={index}
								className={'rounded bg-muted px-2 py-0.5 text-xs'}>
								{ls.language}
							</span>
						))}
					</div>
				</div>
			)}

			{/* Multiplayer */}
			{Boolean(gameRecord.multiplayerModes?.length) && (
				<div>
					<Header className={'mb-4 text-base md:text-sm'} level={5}>{'Multiplayer'}</Header>
					<div className={'flex flex-col gap-3'}>
						{gameRecord.multiplayerModes!.map((mode, index) => (
							<div key={index} className={'flex flex-col gap-1 text-sm'}>
								{mode.platform && (
									<span className={'font-medium'}>{mode.platform}</span>
								)}
								<div className={'flex flex-col gap-0.5 text-xs text-muted-foreground'}>
									{mode.onlineMax != null && <span>{'Online: up to '}{mode.onlineMax}</span>}
									{mode.offlineMax != null && <span>{'Offline: up to '}{mode.offlineMax}</span>}
									{mode.hasSplitscreen && <span>{'Splitscreen'}</span>}
									{mode.hasCampaignCoop && <span>{'Campaign co-op'}</span>}
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{/* AT URI */}
			<div>
				<Header className={'mb-3 text-base md:text-sm'} level={5}>{'AT URI'}</Header>
				<CopyableValue
					label={''}
					value={gameRecord.uri}
					monospace
				/>
			</div>
		</>
	)
}
