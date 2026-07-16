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
				<div className={'flex flex-col gap-1'}>
					<GenresField
						disabled={isDisabled}
						onChange={handleGenresChange}
						value={genres ?? new Set()}
					/>
					<p className={'text-xs text-muted-foreground px-1'}>
						{'The primary gameplay categories, like RPG, Platformer, or Strategy.'}
					</p>
				</div>

				<div className={'flex flex-col gap-1'}>
					<ThemesField
						disabled={isDisabled}
						onChange={handleThemesChange}
						value={themes ?? new Set()}
					/>
					<p className={'text-xs text-muted-foreground px-1'}>
						{'The setting or subject matter, like Sci-Fi, Fantasy, or Historical.'}
					</p>
				</div>

				<div className={'flex flex-col gap-1'}>
					<PlayerPerspectivesField
						disabled={isDisabled}
						onChange={handlePlayerPerspectivesChange}
						value={playerPerspectives ?? new Set()}
					/>
					<p className={'text-xs text-muted-foreground px-1'}>
						{'How the player views the game world, like First Person, Third Person, or Top-Down.'}
					</p>
				</div>

				<div className={'flex flex-col gap-1'}>
					<ModesField
						disabled={isDisabled}
						onChange={handleModesChange}
						value={modes ?? new Set()}
					/>
					<p className={'text-xs text-muted-foreground px-1'}>
						{'How the game is played, like Single Player, Co-op, or MMO.'}
					</p>
				</div>

				{/* releaseDates */}
			</div>
		</Scroller>
	)
}
