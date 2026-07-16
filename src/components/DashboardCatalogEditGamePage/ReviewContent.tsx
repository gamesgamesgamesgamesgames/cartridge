'use client'

// Local imports
import { CommaSeparatedList } from '@/components/CommaSeparatedList/CommaSeparatedList'
import {
	DataList,
	DataListLabel,
	DataListValue,
} from '@/components/DataList/DataList'
import { GAME_APPLICATION_TYPES } from '@/constants/GAME_APPLICATION_TYPES'
import { GAME_MODES } from '@/constants/GAME_MODES'
import { GAME_PLAYER_PERSPECTIVES } from '@/constants/GAME_PLAYER_PERSPECTIVES'
import { GAME_GENRES } from '@/constants/GAME_GENRES'
import { GAME_THEMES } from '@/constants/GAME_THEMES'
import { Scroller } from '@/components/ui/scroller'
import { GAME_PLATFORMS } from '@/constants/GAME_PLATFORMS'
import { useDashboardCatalogEditGameContext } from '@/context/DashboardCatalogEditGameContext/DashboardCatalogEditGameContext'

export function ReviewContent() {
	const {
		applicationType,
		genres,
		media,
		modes,
		name,
		playerPerspectives,
		releases,
		summary,
		themes,
	} = useDashboardCatalogEditGameContext()

	return (
		<Scroller className={'h-full'}>
			<DataList>
				<DataListLabel>{'Name'}</DataListLabel>
				<DataListValue>
					{name || (
						<span className={'italic text-red-400'}>{'Name is required'}</span>
					)}
				</DataListValue>
				<DataListLabel>{'Summary'}</DataListLabel>
				<DataListValue>
					{summary || (
						<span className={'italic text-muted-foreground'}>
							{'No summary provided.'}
						</span>
					)}
				</DataListValue>
				<DataListLabel>{'Type'}</DataListLabel>
				<DataListValue>
					{applicationType
						? (GAME_APPLICATION_TYPES[applicationType]?.name ?? applicationType)
						: ''}
				</DataListValue>
				<DataListLabel>{'Genres'}</DataListLabel>
				<DataListValue>
					{genres?.size ? (
						<CommaSeparatedList
							items={Array.from(genres).map((genre) => (
								<span key={genre}>{GAME_GENRES[genre]?.name ?? genre}</span>
							))}
						/>
					) : (
						<span className={'italic text-muted-foreground'}>
							{'No genres provided'}
						</span>
					)}
				</DataListValue>
				<DataListLabel>{'Themes'}</DataListLabel>
				<DataListValue>
					{themes?.size ? (
						<CommaSeparatedList
							items={Array.from(themes).map((theme) => (
								<span key={theme}>{GAME_THEMES[theme]?.name ?? theme}</span>
							))}
						/>
					) : (
						<span className={'italic text-muted-foreground'}>
							{'No themes provided'}
						</span>
					)}
				</DataListValue>
				<DataListLabel>{'Player Perspectives'}</DataListLabel>
				<DataListValue>
					{playerPerspectives?.size ? (
						<CommaSeparatedList
							items={Array.from(playerPerspectives).map((playerPerspective) => (
								<span key={playerPerspective}>
									{GAME_PLAYER_PERSPECTIVES[playerPerspective]?.name ?? playerPerspective}
								</span>
							))}
						/>
					) : (
						<span className={'italic text-muted-foreground'}>
							{'No player perspectives provided'}
						</span>
					)}
				</DataListValue>
				<DataListLabel>{'Modes'}</DataListLabel>
				<DataListValue>
					{modes?.size ? (
						<CommaSeparatedList
							items={Array.from(modes).map((mode) => (
								<span key={mode}>{GAME_MODES[mode]?.name ?? mode}</span>
							))}
						/>
					) : (
						<span className={'italic text-muted-foreground'}>
							{'No modes provided'}
						</span>
					)}
				</DataListValue>
				<DataListLabel>{'Media'}</DataListLabel>
				<DataListValue>
					{media.length > 0 ? (
						<span>{`${media.length} ${media.length === 1 ? 'item' : 'items'}`}</span>
					) : (
						<span className={'italic text-muted-foreground'}>
							{'No media uploaded'}
						</span>
					)}
				</DataListValue>
				<DataListLabel>{'Releases'}</DataListLabel>
				<DataListValue>
					{releases.length > 0 ? (
						<CommaSeparatedList
							items={releases
								.filter((r) => r.platform)
								.map((r) => (
									<span key={r.platform}>{GAME_PLATFORMS.find((p) => p.id === r.platform)?.label ?? r.platform}</span>
								))}
						/>
					) : (
						<span className={'italic text-muted-foreground'}>
							{'No releases added'}
						</span>
					)}
				</DataListValue>
			</DataList>
		</Scroller>
	)
}
