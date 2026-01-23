'use client'

// Module imports
import { DataList, Em, Flex, Text } from '@radix-ui/themes'

// Local imports
import { CommaSeparatedList } from '@/components/CommaSeparatedList/CommaSeparatedList'
import { DashboardCatalogNewGameFooter } from '@/components/DashboardCatalogNewGameFooter/DashboardCatalogNewGameFooter'
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
		state,
		summary,
		themes,
	} = useDashboardCatalogNewGameContext()

	const isDisabled = state === 'active'

	return (
		<>
			<Flex direction={'column'}></Flex>

			<DataList.Root>
				<DataList.Item>
					<DataList.Label>{'Name'}</DataList.Label>
					<DataList.Value>
						{name || (
							<Text
								color={'tomato'}
								style={{ fontStyle: 'italic' }}>
								{'Name is required'}
							</Text>
						)}
					</DataList.Value>
				</DataList.Item>
				<DataList.Item>
					<DataList.Label>{'Summary'}</DataList.Label>
					<DataList.Value>
						{summary || (
							<Text
								color={'gold'}
								style={{ fontStyle: 'italic' }}>
								{'No summary provided.'}
							</Text>
						)}
					</DataList.Value>
				</DataList.Item>
				<DataList.Item>
					<DataList.Label>{'Type'}</DataList.Label>
					<DataList.Value>
						{applicationType
							? GAME_APPLICATION_TYPES[applicationType].name
							: ''}
					</DataList.Value>
				</DataList.Item>
				<DataList.Item>
					<DataList.Label>{'Genres'}</DataList.Label>
					<DataList.Value>
						{genres?.length ? (
							<CommaSeparatedList
								includeLinks
								items={genres.map((genre) => GAME_GENRES[genre]!.name)}
							/>
						) : (
							<Text
								color={'gold'}
								style={{ fontStyle: 'italic' }}>
								{'No genres provided'}
							</Text>
						)}
					</DataList.Value>
				</DataList.Item>
				<DataList.Item>
					<DataList.Label>{'Themes'}</DataList.Label>
					<DataList.Value>
						{themes?.length ? (
							<CommaSeparatedList
								includeLinks
								items={themes.map((theme) => GAME_THEMES[theme]!.name)}
							/>
						) : (
							<Text
								color={'gold'}
								style={{ fontStyle: 'italic' }}>
								{'No themes provided'}
							</Text>
						)}
					</DataList.Value>
				</DataList.Item>
				<DataList.Item>
					<DataList.Label>{'Player Perspectives'}</DataList.Label>
					<DataList.Value>
						{playerPerspectives?.length ? (
							<CommaSeparatedList
								includeLinks
								items={playerPerspectives.map(
									(playerPerspective) =>
										GAME_PLAYER_PERSPECTIVES[playerPerspective]!.name,
								)}
							/>
						) : (
							<Text
								color={'gold'}
								style={{ fontStyle: 'italic' }}>
								{'No player perspectives provided'}
							</Text>
						)}
					</DataList.Value>
				</DataList.Item>
				<DataList.Item>
					<DataList.Label>{'Modes'}</DataList.Label>
					<DataList.Value>
						{modes?.length ? (
							<CommaSeparatedList
								includeLinks
								items={modes.map((mode) => GAME_MODES[mode]!.name)}
							/>
						) : (
							<Text
								color={'gold'}
								style={{ fontStyle: 'italic' }}>
								{'No modes provided'}
							</Text>
						)}
					</DataList.Value>
				</DataList.Item>
			</DataList.Root>

			<DashboardCatalogNewGameFooter previous={'releases'} />
		</>
	)
}
