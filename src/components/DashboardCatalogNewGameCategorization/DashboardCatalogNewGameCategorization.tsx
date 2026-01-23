'use client'

// Module imports
import { Flex } from '@radix-ui/themes'

// Local imports
import { DashboardCatalogNewGameFooter } from '@/components/DashboardCatalogNewGameFooter/DashboardCatalogNewGameFooter'

import { GenresField } from '@/components/GenresField/GenresField'
import { ModesField } from '@/components/ModesField/ModesField'
import { PlayerPerspectivesField } from '@/components/PlayerPerspectivesField/PlayerPerspectivesField'
import { ThemesField } from '@/components/ThemesField/ThemesField'

import { useDashboardCatalogNewGameContext } from '@/context/DashboardCatalogNewGameContext/DashboardCatalogNewGameContext'

export function DashboardCatalogNewGameCategorization() {
	const {
		genres,
		modes,
		playerPerspectives,
		setGenres,
		setModes,
		setPlayerPerspectives,
		setThemes,
		themes,
		state,
	} = useDashboardCatalogNewGameContext()

	const isDisabled = state === 'active'

	return (
		<>
			<Flex direction={'column'}>
				<GenresField
					disabled={isDisabled}
					onChange={setGenres}
					value={genres ?? []}
				/>

				<ThemesField
					disabled={isDisabled}
					onChange={setThemes}
					value={themes ?? []}
				/>

				<PlayerPerspectivesField
					disabled={isDisabled}
					onChange={setPlayerPerspectives}
					value={playerPerspectives ?? []}
				/>

				<ModesField
					disabled={isDisabled}
					onChange={setModes}
					value={modes ?? []}
				/>

				{/* releaseDates */}
			</Flex>

			<DashboardCatalogNewGameFooter
				next={'releases'}
				previous={'general'}
			/>
		</>
	)
}
