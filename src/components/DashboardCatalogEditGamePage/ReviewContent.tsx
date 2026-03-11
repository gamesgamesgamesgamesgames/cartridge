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
import { useDashboardCatalogEditGameContext } from '@/context/DashboardCatalogEditGameContext/DashboardCatalogEditGameContext'
import { Link } from '../Link/Link'

export function ReviewContent() {
	const {
		applicationType,
		genres,
		modes,
		name,
		playerPerspectives,
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
								<Link href={`/theme/${GAME_GENRES[genre]?.name ?? genre}`}>
									{GAME_GENRES[genre]?.name ?? genre}
								</Link>
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
								<Link href={`/theme/${GAME_THEMES[theme]?.name ?? theme}`}>
									{GAME_THEMES[theme]?.name ?? theme}
								</Link>
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
								<Link
									href={`/theme/${GAME_PLAYER_PERSPECTIVES[playerPerspective]?.name ?? playerPerspective}`}>
									{GAME_PLAYER_PERSPECTIVES[playerPerspective]?.name ??
										playerPerspective}
								</Link>
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
								<Link href={`/theme/${GAME_MODES[mode]?.id ?? mode}`}>
									{GAME_MODES[mode]?.name ?? mode}
								</Link>
							))}
						/>
					) : (
						<span className={'italic text-muted-foreground'}>
							{'No modes provided'}
						</span>
					)}
				</DataListValue>
			</DataList>
		</Scroller>
	)
}
