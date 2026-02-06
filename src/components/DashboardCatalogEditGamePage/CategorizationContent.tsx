'use client'

// Module imports
import { useCallback } from 'react'

// Local imports
import { GenresField } from '@/components/GenresField/GenresField'
import {
	type Genre,
	type Mode,
	type PlayerPerspective,
	type Theme,
} from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'
import { ModesField } from '@/components/ModesField/ModesField'
import { PlayerPerspectivesField } from '@/components/PlayerPerspectivesField/PlayerPerspectivesField'
import { Scroller } from '@/components/ui/scroller'
import { ThemesField } from '@/components/ThemesField/ThemesField'
import { useDashboardCatalogEditGameContext } from '@/context/DashboardCatalogEditGameContext/DashboardCatalogEditGameContext'

export function CategorizationContent() {
	const {
		addGenre,
		addMode,
		addPlayerPerspective,
		addTheme,
		genres,
		modes,
		playerPerspectives,
		removeGenre,
		removeMode,
		removePlayerPerspective,
		removeTheme,
		themes,
		state,
	} = useDashboardCatalogEditGameContext()

	const isDisabled = state === 'active'

	const handleGenresChange = useCallback(
		(id: Genre) => (isChecked: boolean) => {
			if (isChecked) {
				addGenre(id)
			} else {
				removeGenre(id)
			}
		},
		[],
	)

	const handleModesChange = useCallback(
		(id: Mode) => (isChecked: boolean) => {
			if (isChecked) {
				addMode(id)
			} else {
				removeMode(id)
			}
		},
		[],
	)

	const handlePlayerPerspectivesChange = useCallback(
		(id: PlayerPerspective) => (isChecked: boolean) => {
			if (isChecked) {
				addPlayerPerspective(id)
			} else {
				removePlayerPerspective(id)
			}
		},
		[],
	)

	const handleThemesChange = useCallback(
		(id: Theme) => (isChecked: boolean) => {
			if (isChecked) {
				addTheme(id)
			} else {
				removeTheme(id)
			}
		},
		[],
	)

	return (
		<Scroller className={'h-full'}>
			<div className={'flex flex-col gap-4'}>
				<GenresField
					disabled={isDisabled}
					onChange={handleGenresChange}
					value={genres ?? new Set()}
				/>

				<ThemesField
					disabled={isDisabled}
					onChange={handleThemesChange}
					value={themes ?? new Set()}
				/>

				<PlayerPerspectivesField
					disabled={isDisabled}
					onChange={handlePlayerPerspectivesChange}
					value={playerPerspectives ?? new Set()}
				/>

				<ModesField
					disabled={isDisabled}
					onChange={handleModesChange}
					value={modes ?? new Set()}
				/>

				{/* releaseDates */}
			</div>
		</Scroller>
	)
}
