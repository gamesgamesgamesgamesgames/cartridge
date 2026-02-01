'use client'

// Local imports
import { CommaSeparatedList } from '@/components/CommaSeparatedList/CommaSeparatedList'
import { DataList, DataListLabel } from '@/components/DataList/DataList'
import { GAME_APPLICATION_TYPES } from '@/constants/GAME_APPLICATION_TYPES'
import { GAME_MODES } from '@/constants/GAME_MODES'
import { GAME_PLAYER_PERSPECTIVES } from '@/constants/GAME_PLAYER_PERSPECTIVES'
import { GAME_GENRES } from '@/constants/GAME_GENRES'
import { GAME_THEMES } from '@/constants/GAME_THEMES'
import { useDashboardCatalogNewGameContext } from '@/context/DashboardCatalogNewGameContext/DashboardCatalogNewGameContext'

export function DashboardCatalogNewGameReview() {
	const {
		applicationType,
		genres,
		modes,
		name,
		playerPerspectives,
		summary,
		themes,
	} = useDashboardCatalogNewGameContext()

	return (
		<DataList>
			<DataListLabel>{'Name'}</DataListLabel>
			<dd>
				{name || (
					<div className={'italic text-red-400'}>{'Name is required'}</div>
				)}
			</dd>
			<DataListLabel>{'Summary'}</DataListLabel>
			<dd>
				{summary || (
					<div className={'italic text-muted-foreground'}>
						{'No summary provided.'}
					</div>
				)}
			</dd>
			<DataListLabel>{'Type'}</DataListLabel>
			<dd>
				{applicationType ? GAME_APPLICATION_TYPES[applicationType].name : ''}
			</dd>
			<DataListLabel>{'Genres'}</DataListLabel>
			<dd>
				{genres?.size ? (
					<CommaSeparatedList
						includeLinks
						items={Array.from(genres).map((genre) => GAME_GENRES[genre]!.name)}
					/>
				) : (
					<div className={'italic text-muted-foreground'}>
						{'No genres provided'}
					</div>
				)}
			</dd>
			<DataListLabel>{'Themes'}</DataListLabel>
			<dd>
				{themes?.size ? (
					<CommaSeparatedList
						includeLinks
						items={Array.from(themes).map((theme) => GAME_THEMES[theme]!.name)}
					/>
				) : (
					<div className={'italic text-muted-foreground'}>
						{'No themes provided'}
					</div>
				)}
			</dd>
			<DataListLabel>{'Player Perspectives'}</DataListLabel>
			<dd>
				{playerPerspectives?.size ? (
					<CommaSeparatedList
						includeLinks
						items={Array.from(playerPerspectives).map(
							(playerPerspective) =>
								GAME_PLAYER_PERSPECTIVES[playerPerspective]!.name,
						)}
					/>
				) : (
					<div className={'italic text-muted-foreground'}>
						{'No player perspectives provided'}
					</div>
				)}
			</dd>
			<DataListLabel>{'Modes'}</DataListLabel>
			<dd>
				{modes?.size ? (
					<CommaSeparatedList
						includeLinks
						items={Array.from(modes).map((mode) => GAME_MODES[mode]!.name)}
					/>
				) : (
					<div className={'italic text-muted-foreground'}>
						{'No modes provided'}
					</div>
				)}
			</dd>
		</DataList>
	)
}
