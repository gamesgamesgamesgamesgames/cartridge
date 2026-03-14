// Local imports
import {
	DataList,
	DataListLabel,
	DataListValue,
} from '@/components/DataList/DataList'
import { SectionHeader } from './SectionHeader'
import { type GameRecord } from '@/typedefs/GameRecord'
import {
	type LanguageSupport,
	type MultiplayerMode,
	type Website,
} from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'
import { Fragment } from 'react'

// Constants
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
	'steam',
	'gog',
	'epicGames',
	'itchIo',
	'xbox',
	'playstation',
	'nintendo',
	'meta',
])

const SOCIAL_TYPES = new Set([
	'twitter',
	'instagram',
	'youtube',
	'twitch',
	'discord',
	'reddit',
	'facebook',
	'bluesky',
])

// Types
type Props = Readonly<{ gameRecord: GameRecord }>

function WebsiteRow(props: {
	prefix: string
	index: number
	website: Website
}) {
	const { prefix, index, website } = props
	const label =
		WEBSITE_TYPE_LABELS[website.type ?? 'other'] ?? website.type ?? 'Other'

	return (
		<>
			<DataListLabel key={`${prefix}-${index}-label`}>{label}</DataListLabel>
			<DataListValue key={`${prefix}-${index}-value`}>
				<a
					href={website.url}
					target={'_blank'}
					rel={'noopener noreferrer'}
					className={'text-primary underline hover:no-underline'}>
					{website.url}
				</a>
			</DataListValue>
		</>
	)
}

function LanguageSupportTable(props: { languageSupports: LanguageSupport[] }) {
	const { languageSupports } = props

	return (
		<div className={'overflow-x-auto'}>
			<table className={'w-full text-sm'}>
				<thead>
					<tr className={'border-b border-border text-left'}>
						<th className={'px-3 py-2 font-medium'}>{'Language'}</th>
						<th className={'px-3 py-2 text-center font-medium'}>{'Audio'}</th>
						<th className={'px-3 py-2 text-center font-medium'}>
							{'Subtitles'}
						</th>
						<th className={'px-3 py-2 text-center font-medium'}>
							{'Interface'}
						</th>
					</tr>
				</thead>
				<tbody>
					{languageSupports.map((ls, index) => (
						<tr
							key={index}
							className={'border-b border-border/50'}>
							<td className={'px-3 py-2'}>{ls.language}</td>
							<td className={'px-3 py-2 text-center'}>{ls.audio ? '✓' : ''}</td>
							<td className={'px-3 py-2 text-center'}>
								{ls.subtitles ? '✓' : ''}
							</td>
							<td className={'px-3 py-2 text-center'}>
								{ls.interface ? '✓' : ''}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}

function MultiplayerModeCard(props: { mode: MultiplayerMode; index: number }) {
	const { mode, index } = props

	return (
		<div className={'rounded-lg border border-border p-4'}>
			{mode.platform && <h4 className={'mb-3 font-medium'}>{mode.platform}</h4>}

			<div className={'grid grid-cols-2 gap-x-6 gap-y-2 text-sm'}>
				{mode.onlineMax != null && (
					<>
						<span className={'text-muted-foreground'}>{'Online Max'}</span>
						<span>{mode.onlineMax}</span>
					</>
				)}
				{mode.offlineMax != null && (
					<>
						<span className={'text-muted-foreground'}>{'Offline Max'}</span>
						<span>{mode.offlineMax}</span>
					</>
				)}
				{mode.onlineCoopMax != null && (
					<>
						<span className={'text-muted-foreground'}>
							{'Online Co-op Max'}
						</span>
						<span>{mode.onlineCoopMax}</span>
					</>
				)}
				{mode.offlineCoopMax != null && (
					<>
						<span className={'text-muted-foreground'}>
							{'Offline Co-op Max'}
						</span>
						<span>{mode.offlineCoopMax}</span>
					</>
				)}
				{mode.hasCampaignCoop != null && (
					<>
						<span className={'text-muted-foreground'}>{'Campaign Co-op'}</span>
						<span>{mode.hasCampaignCoop ? '✓' : ''}</span>
					</>
				)}
				{mode.hasDropIn != null && (
					<>
						<span className={'text-muted-foreground'}>{'Drop-in'}</span>
						<span>{mode.hasDropIn ? '✓' : ''}</span>
					</>
				)}
				{mode.hasLanCoop != null && (
					<>
						<span className={'text-muted-foreground'}>{'LAN Co-op'}</span>
						<span>{mode.hasLanCoop ? '✓' : ''}</span>
					</>
				)}
				{mode.hasSplitscreen != null && (
					<>
						<span className={'text-muted-foreground'}>{'Splitscreen'}</span>
						<span>{mode.hasSplitscreen ? '✓' : ''}</span>
					</>
				)}
				{mode.hasSplitscreenOnline != null && (
					<>
						<span className={'text-muted-foreground'}>
							{'Splitscreen Online'}
						</span>
						<span>{mode.hasSplitscreenOnline ? '✓' : ''}</span>
					</>
				)}
			</div>
		</div>
	)
}

export function MetaTab(props: Props) {
	const { gameRecord } = props

	const externalIds = gameRecord.externalIds
	const hasExternalIds =
		externalIds &&
		Object.entries(externalIds).some(
			([key, value]) => key !== '$type' && value != null,
		)

	const websites = gameRecord.websites ?? []
	const stores = websites.filter((w) => STORE_TYPES.has(w.type ?? ''))
	const socials = websites.filter((w) => SOCIAL_TYPES.has(w.type ?? ''))
	const otherLinks = websites.filter(
		(w) => !STORE_TYPES.has(w.type ?? '') && !SOCIAL_TYPES.has(w.type ?? ''),
	)

	const languageSupports = gameRecord.languageSupports ?? []
	const multiplayerModes = gameRecord.multiplayerModes ?? []

	return (
		<>
			{hasExternalIds && (
				<SectionHeader
					id={'meta-external-ids'}
					title={'External IDs'}>
					<DataList className={'gap-x-10 gap-y-4'}>
						{Object.entries(externalIds).map(([key, value]) => {
							if (key === '$type' || value == null) return null

							const label = EXTERNAL_ID_LABELS[key] ?? key

							if (key === 'itchIo' && typeof value === 'object') {
								const itchIo = value as { developer?: string; game?: string }
								return (
									<>
										<DataListLabel key={`${key}-dev`}>
											{'itch.io Developer'}
										</DataListLabel>
										<DataListValue key={`${key}-dev-val`}>
											{itchIo.developer}
										</DataListValue>
										<DataListLabel key={`${key}-game`}>
											{'itch.io Game'}
										</DataListLabel>
										<DataListValue key={`${key}-game-val`}>
											{itchIo.game}
										</DataListValue>
									</>
								)
							}

							return (
								<Fragment key={key}>
									<DataListLabel key={`${key}-label`}>{label}</DataListLabel>
									<DataListValue key={`${key}-value`}>
										{String(value)}
									</DataListValue>
								</Fragment>
							)
						})}
					</DataList>
				</SectionHeader>
			)}

			{stores.length > 0 && (
				<SectionHeader
					id={'meta-stores'}
					title={'Stores'}>
					<DataList className={'gap-x-10 gap-y-4'}>
						{stores.map((website, index) => (
							<WebsiteRow
								key={index}
								prefix={'store'}
								index={index}
								website={website}
							/>
						))}
					</DataList>
				</SectionHeader>
			)}

			{socials.length > 0 && (
				<SectionHeader
					id={'meta-socials'}
					title={'Socials'}>
					<DataList className={'gap-x-10 gap-y-4'}>
						{socials.map((website, index) => (
							<WebsiteRow
								key={index}
								prefix={'social'}
								index={index}
								website={website}
							/>
						))}
					</DataList>
				</SectionHeader>
			)}

			{otherLinks.length > 0 && (
				<SectionHeader
					id={'meta-other-links'}
					title={'Other Links'}>
					<DataList className={'gap-x-10 gap-y-4'}>
						{otherLinks.map((website, index) => (
							<WebsiteRow
								key={index}
								prefix={'other'}
								index={index}
								website={website}
							/>
						))}
					</DataList>
				</SectionHeader>
			)}

			{languageSupports.length > 0 && (
				<SectionHeader
					id={'meta-language-supports'}
					title={'Language Support'}>
					<LanguageSupportTable languageSupports={languageSupports} />
				</SectionHeader>
			)}

			{multiplayerModes.length > 0 && (
				<SectionHeader
					id={'meta-multiplayer-modes'}
					title={'Multiplayer Modes'}>
					<div className={'grid gap-4'}>
						{multiplayerModes.map((mode, index) => (
							<MultiplayerModeCard
								key={index}
								mode={mode}
								index={index}
							/>
						))}
					</div>
				</SectionHeader>
			)}
		</>
	)
}
